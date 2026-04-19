import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, calculatePlatformFee } from "@/lib/paystack";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      await handleChargeSuccess(event.data);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ status: "ok" }); // always 200 to stop retries
  }
}

async function handleChargeSuccess(data: any) {
  const reference = data.reference;
  const amountKES = data.amount / 100; // Paystack sends in kobo

  const payment = await db.payment.findFirst({
    where: { reference },
    include: {
      invoice: {
        include: {
          organization: true,
          tenant: true,
          unit: { include: { property: true } },
        },
      },
    },
  });

  if (!payment) {
    console.warn(`Paystack webhook: no payment found for reference ${reference}`);
    return;
  }

  if (payment.status === "COMPLETED") return; // idempotent

  const org = payment.invoice.organization;

  // Calculate split
  const platformFee = calculatePlatformFee(amountKES, {
    platformFeeRate: org.platformFeeRate,
    platformFeeMin: org.platformFeeMin,
    platformFeeMax: org.platformFeeMax,
  });
  const landlordAmount = amountKES - platformFee;

  // Update payment with split details
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      paystackRef: String(data.id),
      platformFee,
      landlordAmount,
      feeRate: org.platformFeeRate,
      isReconciled: true,
      reconciledAt: new Date(),
    },
  });

  // Reconcile invoice
  const newPaid = payment.invoice.paidAmount + amountKES;
  const newBalance = payment.invoice.totalAmount - newPaid;
  await db.invoice.update({
    where: { id: payment.invoice.id },
    data: {
      paidAmount: newPaid,
      balanceAmount: Math.max(0, newBalance),
      status: newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING",
      paidDate: newBalance <= 0 ? new Date() : undefined,
    },
  });

  // Write reconciliation record
  const tenant = payment.invoice.tenant;
  const unit = payment.invoice.unit;
  await db.reconciliation.create({
    data: {
      organizationId: org.id,
      paymentId: payment.id,
      invoiceId: payment.invoice.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      propertyUnit: unit
        ? `${unit.property.name} — Unit ${unit.unitNumber}`
        : "N/A",
      totalAmount: amountKES,
      platformFee,
      landlordAmount,
      feeRate: org.platformFeeRate,
      paystackRef: reference,
      status: "COMPLETED",
    },
  });

  // Real-time notification to landlord
  await db.notification.create({
    data: {
      organizationId: org.id,
      title: "Rent Received — Reconciled",
      message: `KES ${landlordAmount.toLocaleString("en-KE")} net to you · KES ${amountKES.toLocaleString("en-KE")} paid by ${tenant.firstName} ${tenant.lastName} · Platform fee: KES ${platformFee.toLocaleString("en-KE")} (${org.platformFeeRate}%)`,
      type: "PAYMENT_RECEIVED",
      channel: "IN_APP",
    },
  });
}
