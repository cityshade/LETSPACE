/**
 * Cornerstone Paystack Webhook — Moat Convergence Point
 *
 * This is where all 4 pillars execute on every payment:
 *   Pillar 1: Instant recon — split verified, waterfall applied, reconciliation posted
 *   Pillar 2: Paperless automation — SMS receipt to tenant + notification to landlord
 *   Pillar 3: Immutable ledger — append-only entries with SHA-256 chain
 *   Pillar 4: Max revenue — platform fee, agent commission, referral discount applied
 *
 * HMAC-SHA512 signature verified before any processing.
 * Idempotent — safe to receive the same event multiple times.
 * Always returns 200 to prevent Paystack retry storms.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { db } from "@/lib/db";
import { LedgerService } from "@/lib/ledger";
import { allocatePayment, formatWaterfallSummary, type TenantBalance } from "@/lib/waterfall";
import { SMS } from "@/lib/sms";
import {
  calculateRevenueSplit,
  recordRentCommission,
  processReferralConversion,
} from "@/lib/commission";

// ─── Webhook entry point ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // CRITICAL: Verify before any processing
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;
      case "transfer.failed":
        await handleTransferFailed(event.data);
        break;
      default:
        await db.auditLog.create({
          data: {
            action: "PAYSTACK_UNHANDLED_EVENT",
            resource: "webhook",
            newValues: { event: event.event },
          },
        });
    }
  } catch (err) {
    // Log but always return 200 — prevents Paystack retry storms
    console.error("Paystack webhook processing error:", err);
    await db.auditLog.create({
      data: {
        action: "PAYSTACK_WEBHOOK_ERROR",
        resource: "webhook",
        newValues: { event: event.event, error: String(err) },
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}

// ─── charge.success ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: PaystackChargeData) {
  const reference = data.reference;
  const amountKES = data.amount / 100;

  const payment = await db.payment.findFirst({
    where: { reference },
    include: {
      invoice: {
        include: {
          organization: true,
          tenant: true,
          lease: true,
          unit: { include: { property: true } },
        },
      },
    },
  });

  if (!payment) {
    console.warn(`Paystack webhook: no payment for reference ${reference}`);
    return;
  }

  // Idempotency
  if (payment.status === "COMPLETED") return;

  const { invoice } = payment;
  const { organization: org, tenant, lease, unit } = invoice;

  if (!lease || !unit) {
    console.warn(`Payment ${payment.id}: no lease/unit — skipping`);
    return;
  }

  // ── Pillar 3: Current ledger state ───────────────────────────────────────────

  const penaltyDebits = await db.ledgerEntry.aggregate({
    where: { leaseId: lease.id, component: "PENALTY", direction: "DEBIT" },
    _sum: { amount: true },
  });
  const penaltyCredits = await db.ledgerEntry.aggregate({
    where: { leaseId: lease.id, component: "PENALTY", direction: "CREDIT" },
    _sum: { amount: true },
  });

  const tenantBalance: TenantBalance = {
    penalty:       Math.max(0, (penaltyDebits._sum.amount ?? 0) - (penaltyCredits._sum.amount ?? 0)),
    garbage:       0,
    water:         0,
    serviceCharge: unit.serviceCharge ?? 0,
    rent:          Math.max(0, (invoice.balanceAmount ?? invoice.totalAmount) - (invoice.paidAmount ?? 0)),
  };

  // ── Pillar 1: Waterfall allocation ───────────────────────────────────────────

  const propConfig = await db.propertyConfig.findUnique({
    where: { propertyId: unit.propertyId },
  });
  const waterfallOrder = (propConfig?.waterfallOrder ?? [
    "PENALTY", "GARBAGE", "WATER", "SERVICE_CHARGE", "RENT",
  ]) as any[];

  const waterfall = allocatePayment(amountKES, tenantBalance, waterfallOrder);

  // ── Pillar 4: Revenue split (rent component only) ────────────────────────────

  const rentAllocation = waterfall.allocations.find((a) => a.bucket === "RENT");
  const rentAmount = rentAllocation?.applied ?? 0;

  const agentPct   = propConfig?.agentCommissionPct ?? 0;
  const platformPct = 10;

  const split = calculateRevenueSplit(rentAmount, { platformPct, agentPct });

  // ── Pillar 3: Immutable ledger entries per waterfall bucket ──────────────────

  for (const allocation of waterfall.allocations) {
    if (allocation.applied <= 0) continue;
    const isRent = allocation.bucket === "RENT";

    await LedgerService.credit({
      organizationId: org.id,
      leaseId: lease.id,
      tenantId: tenant.id,
      unitId: unit.id,
      propertyId: unit.propertyId,
      paymentId: payment.id,
      type: waterfall.ledgerCreditTypes[allocation.bucket],
      component: allocation.bucket,
      amount: allocation.applied,
      description: `Payment ${reference} — ${allocation.bucket.replace(/_/g, " ").toLowerCase()}`,
      reference,
      platformShare: isRent ? split.platformFee : 0,
      agentShare:    isRent ? split.agentCommission : 0,
      landlordShare: isRent ? split.landlordNet : allocation.applied,
    });
  }

  // ── Update payment + invoice ─────────────────────────────────────────────────

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      paystackRef: String(data.id),
      platformFee: split.platformFee,
      landlordAmount: split.landlordNet,
      feeRate: platformPct,
      isReconciled: true,
      reconciledAt: new Date(),
    },
  });

  const newPaid    = (invoice.paidAmount ?? 0) + amountKES;
  const newBalance = Math.max(0, invoice.totalAmount - newPaid);

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      paidAmount:    newPaid,
      balanceAmount: newBalance,
      status:        newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING",
      paidDate:      newBalance <= 0 ? new Date() : undefined,
    },
  });

  // ── Reconciliation record ────────────────────────────────────────────────────

  await db.reconciliation.create({
    data: {
      organizationId: org.id,
      paymentId: payment.id,
      invoiceId: invoice.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      propertyUnit: `${unit.property.name} — Unit ${unit.unitNumber}`,
      totalAmount: amountKES,
      platformFee: split.platformFee,
      landlordAmount: split.landlordNet,
      feeRate: platformPct,
      paystackRef: reference,
      status: "COMPLETED",
    },
  });

  // ── Pillar 4: Agent commission ───────────────────────────────────────────────

  if (split.agentCommission > 0) {
    const agentMember = await db.organizationUser.findFirst({
      where: { organizationId: org.id, role: { in: ["AGENT", "MANAGER"] }, isActive: true },
    });
    if (agentMember) {
      await recordRentCommission({
        organizationId: org.id,
        agentUserId: agentMember.userId,
        propertyId: unit.propertyId,
        unitId: unit.id,
        leaseId: lease.id,
        grossRent: rentAmount,
        commissionPct: agentPct,
      });
    }
  }

  // ── Referral conversion ──────────────────────────────────────────────────────

  const referralCode = data.metadata?.referral_code;
  if (referralCode) {
    await processReferralConversion({
      referralCode,
      referredTenantId: tenant.id,
      referredLeaseId: lease.id,
      rentAmount: lease.rentAmount,
    }).catch((e) => console.warn("Referral error:", e));
  }

  // ── Pillar 2: SMS receipt ────────────────────────────────────────────────────

  if (tenant.phone) {
    await SMS.send({
      phone: tenant.phone,
      template: "PAYMENT_RECEIPT",
      organizationId: org.id,
      tenantId: tenant.id,
      data: {
        tenantName:    tenant.firstName,
        unitCode:      unit.unitNumber,
        amountStr:     amountKES.toLocaleString("en-KE"),
        receiptNumber: `CS-${reference.slice(-8).toUpperCase()}`,
        breakdown:     formatWaterfallSummary(waterfall),
        balanceStr:    newBalance.toLocaleString("en-KE"),
      },
    });
  }

  // ── In-app notification ──────────────────────────────────────────────────────

  await db.notification.create({
    data: {
      organizationId: org.id,
      title: `Rent received — ${unit.unitNumber}`,
      message:
        `KES ${amountKES.toLocaleString("en-KE")} from ${tenant.firstName} ${tenant.lastName}. ` +
        `Net to you: KES ${split.landlordNet.toLocaleString("en-KE")}. ` +
        `Platform: KES ${split.platformFee.toLocaleString("en-KE")}.`,
      type: "PAYMENT_RECEIVED",
      channel: "IN_APP",
      metadata: {
        paymentId: payment.id,
        reference,
        waterfall: waterfall.allocations.map((a) => ({ bucket: a.bucket, applied: a.applied })),
      },
    },
  });

  // ── Audit log ────────────────────────────────────────────────────────────────

  await db.auditLog.create({
    data: {
      action: "PAYMENT_PROCESSED",
      resource: "payment",
      resourceId: payment.id,
      newValues: {
        reference,
        amountKES,
        platformFee: split.platformFee,
        agentCommission: split.agentCommission,
        landlordNet: split.landlordNet,
        waterfall: waterfall.allocations as unknown as Record<string, unknown>[],
      },
    },
  });
}

// ─── transfer.success ─────────────────────────────────────────────────────────

async function handleTransferSuccess(data: any) {
  await db.auditLog.create({
    data: {
      action: "PAYSTACK_TRANSFER_SUCCESS",
      resource: "transfer",
      resourceId: data.reference,
      newValues: { amount: data.amount / 100, recipient: data.recipient?.name },
    },
  });
}

// ─── transfer.failed ──────────────────────────────────────────────────────────

async function handleTransferFailed(data: any) {
  await db.notification.create({
    data: {
      organizationId: data.metadata?.organizationId ?? "system",
      title: "Settlement transfer failed",
      message:
        `Paystack transfer failed: ${data.failures?.[0]?.reason ?? "unknown"}. ` +
        `Amount: KES ${(data.amount / 100).toLocaleString("en-KE")}. Ref: ${data.reference}.`,
      type: "SYSTEM",
      channel: "IN_APP",
      metadata: data,
    },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaystackChargeData {
  id: number;
  reference: string;
  amount: number; // kobo
  status: string;
  paid_at: string;
  metadata: Record<string, any>;
  subaccount?: { id: string; account_code: string };
}
