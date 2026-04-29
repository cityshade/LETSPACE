/**
 * n8n calls this endpoint at 8 AM and 6 PM daily.
 * Sends the daily SMS reminder cadence to all tenants per their property config.
 *
 * Also handles two-way inbound SMS commands from Africa's Talking.
 */

import { NextRequest, NextResponse } from "next/server";
import { SMS } from "@/lib/sms";
import { db } from "@/lib/db";

const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET!;

// ─── Outbound cadence (POST from n8n) ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Check if this is an inbound SMS from Africa's Talking (they POST too)
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return handleInboundSMS(req);
  }

  // Otherwise: automation cron call from n8n
  const secret = req.headers.get("x-automation-secret");
  if (secret !== AUTOMATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId } = await req.json().catch(() => ({}));
  const today = new Date();
  const dayOfMonth = today.getDate();

  try {
    const leases = await db.lease.findMany({
      where: {
        status: "ACTIVE",
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        tenant: true,
        unit: { include: { property: true } },
        organization: true,
      },
    });

    let sent = 0;
    let skipped = 0;

    for (const lease of leases) {
      if (!lease.tenant.phone) { skipped++; continue; }

      const config = await db.propertyConfig.findUnique({
        where: { propertyId: lease.unit.propertyId },
      });

      if (config && config.smsEnabled === false) { skipped++; continue; }

      const reminderDays = config?.smsReminderDays ?? [3, 5, 10, 11, 12, 13, 14, 15, 16];
      if (!reminderDays.includes(dayOfMonth)) { skipped++; continue; }

      // Check if rent is paid this month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const paidThisMonth = await db.ledgerEntry.aggregate({
        where: {
          leaseId: lease.id,
          type: "RENT_PAYMENT",
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      });
      if ((paidThisMonth._sum.amount ?? 0) >= lease.rentAmount) { skipped++; continue; }

      const dueDay = config?.lateFeeDueDay ?? lease.paymentDueDay ?? 10;
      const daysUntilDue = dueDay - dayOfMonth;
      const daysLate = Math.max(0, dayOfMonth - dueDay);

      const payLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${lease.id}`;

      // Balance for this tenant (current ledger balance)
      const lastEntry = await db.ledgerEntry.findFirst({
        where: { leaseId: lease.id },
        orderBy: { createdAt: "desc" },
        select: { runningBalance: true },
      });
      const balance = lastEntry?.runningBalance ?? lease.rentAmount;

      let template: Parameters<typeof SMS.send>[0]["template"];

      if (dayOfMonth === dueDay) {
        template = "DUE_TODAY";
      } else if (daysLate === 1) {
        template = "ARREARS_DAY_11";
      } else if (daysLate === 2) {
        template = "ARREARS_DAY_12";
      } else if (daysLate === 3) {
        template = "ARREARS_DAY_13";
      } else if (daysLate === 4) {
        template = "ARREARS_DAY_14";
      } else if (daysLate >= 5) {
        template = "ARREARS_DAY_15";
      } else if (daysUntilDue <= 5 && daysUntilDue > 2) {
        template = "REMINDER_DAY_5";
      } else if (daysUntilDue <= 7) {
        template = "REMINDER_DAY_3";
      } else {
        template = "INVOICE_ISSUED";
      }

      await SMS.send({
        phone: lease.tenant.phone,
        template,
        organizationId: lease.organizationId,
        tenantId: lease.tenantId,
        data: {
          tenantName:  lease.tenant.firstName,
          unitCode:    lease.unit.unitNumber,
          propertyName: lease.unit.property.name,
          amountStr:   lease.rentAmount.toLocaleString("en-KE"),
          balanceStr:  balance.toLocaleString("en-KE"),
          dueDate:     `${dueDay}th`,
          daysLate,
          payLink,
        },
      });
      sent++;
    }

    return NextResponse.json({ ok: true, sent, skipped });
  } catch (err) {
    console.error("SMS cadence error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ─── Inbound SMS (Africa's Talking webhook) ───────────────────────────────────

async function handleInboundSMS(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const from    = params.get("from") ?? "";
  const message = (params.get("text") ?? "").trim();

  const { command, args } = SMS.parseInbound(message);

  // Find tenant by phone number
  const tenant = await db.tenant.findFirst({
    where: { phone: from },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { unit: { include: { property: true } } },
        take: 1,
      },
    },
  });

  if (!tenant || tenant.leases.length === 0) {
    // Unknown sender — no action
    return NextResponse.json({ ok: true });
  }

  const lease = tenant.leases[0];
  const unit  = lease.unit;
  const payLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${lease.id}`;

  const lastEntry = await db.ledgerEntry.findFirst({
    where: { leaseId: lease.id },
    orderBy: { createdAt: "desc" },
    select: { runningBalance: true },
  });
  const balance = lastEntry?.runningBalance ?? 0;

  switch (command) {
    case "BALANCE":
    case "PAID":
      await SMS.send({
        phone: from,
        template: "BALANCE_REPLY",
        tenantId: tenant.id,
        organizationId: tenant.organizationId,
        data: {
          tenantName: tenant.firstName,
          unitCode: unit.unitNumber,
          balanceStr: Math.max(0, balance).toLocaleString("en-KE"),
          payLink,
        },
      });
      break;

    case "WATER": {
      const reading = parseFloat(args[0]);
      if (isNaN(reading)) {
        await SMS.send({
          phone: from,
          message: `Invalid reading. Send: WATER [meter reading] e.g. WATER 00543 — Cornerstone`,
        });
        break;
      }

      // Store reading (simplified — full implementation in water automation)
      await db.auditLog.create({
        data: {
          action: "WATER_READING_SMS",
          resource: "water_reading",
          resourceId: lease.id,
          newValues: { reading, phone: from, tenantId: tenant.id, unitId: unit.id },
        },
      });

      await SMS.send({
        phone: from,
        template: "WATER_CONFIRM",
        tenantId: tenant.id,
        organizationId: tenant.organizationId,
        data: {
          unitCode: unit.unitNumber,
          waterReading: reading,
          waterBillStr: "0", // calculated by water automation workflow
        },
      });
      break;
    }

    case "HELP":
    case "STOP":
      await SMS.send({
        phone: from,
        template: "HELP_REPLY",
        tenantId: tenant.id,
      });
      break;
  }

  // Africa's Talking expects plain text 200 response
  return new NextResponse("OK", { status: 200 });
}
