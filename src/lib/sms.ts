/**
 * Cornerstone SMS Service — Pillar 2 (Paperless Automation)
 *
 * Africa's Talking primary. Sozuri fallback. Retry queue on both failures.
 * Two-way SMS commands. 14+ templates. Every SMS logged immutably.
 *
 * Usage:
 *   await SMS.send({ phone: "+254712345678", template: "PAYMENT_RECEIPT", data: {...} })
 *   await SMS.send({ phone, message: "Custom one-off" })
 */

import { db } from "@/lib/db";

// ─── Config ───────────────────────────────────────────────────────────────────

const AT_KEY      = process.env.AFRICAS_TALKING_API_KEY!;
const AT_USER     = process.env.AFRICAS_TALKING_USERNAME ?? "sandbox";
const AT_SENDER   = process.env.AFRICAS_TALKING_SENDER_ID ?? "CORNERSTONE";
const SOZURI_KEY  = process.env.SOZURI_API_KEY!;
const SOZURI_FROM = process.env.SOZURI_SENDER_ID ?? "CORNERSTONE";

// ─── Templates ────────────────────────────────────────────────────────────────

export type SmsTemplateId =
  | "INVOICE_ISSUED"        // Day 1
  | "REMINDER_DAY_3"        // Day 3
  | "REMINDER_DAY_5"        // Day 5
  | "DUE_TODAY"             // Day 10
  | "ARREARS_DAY_11"        // Day 11
  | "ARREARS_DAY_12"        // Day 12 - deposit warning
  | "ARREARS_DAY_13"        // Day 13
  | "ARREARS_DAY_14"        // Day 14
  | "ARREARS_DAY_15"        // Day 15
  | "DEPOSIT_WARNING"       // Day 12-15 general
  | "DEPOSIT_DEPLETED"      // Day 16 - used deposit
  | "PAYMENT_RECEIPT"       // On payment
  | "INVITE_TENANT"         // New tenant invite
  | "WATER_READING_REQUEST" // Water reading
  | "REFERRAL_DISCOUNT"     // Referral earned
  | "PAYMENT_PLAN_APPROVED" // Plan approved
  | "DEPOSIT_TOP_UP"        // Top-up reminder
  | "EVICTION_NOTICE"       // Day 61
  | "BALANCE_REPLY"         // Response to BALANCE command
  | "WATER_CONFIRM"         // Response to WATER command
  | "HELP_REPLY";            // Response to HELP command

interface TemplateData {
  tenantName?: string;
  unitCode?: string;
  propertyName?: string;
  amount?: number;
  amountStr?: string;
  dueDate?: string;
  daysLate?: number;
  balance?: number;
  balanceStr?: string;
  depositBalance?: number;
  depositStr?: string;
  payLink?: string;
  referralCode?: string;
  discountPct?: number;
  discountAmount?: number;
  nextMonth?: string;
  waterReading?: number;
  waterBill?: number;
  waterBillStr?: string;
  agentName?: string;
  receiptNumber?: string;
  breakdown?: string;   // waterfall summary
}

function fmt(n?: number): string {
  if (n === undefined) return "0";
  return n.toLocaleString("en-KE");
}

const TEMPLATES: Record<SmsTemplateId, (d: TemplateData) => string> = {
  INVOICE_ISSUED: (d) =>
    `Hi ${d.tenantName}, your rent invoice for ${d.unitCode} - ${d.propertyName} is ready. Due: KES ${d.amountStr} by ${d.dueDate}. Pay: ${d.payLink} — Cornerstone`,

  REMINDER_DAY_3: (d) =>
    `Hi ${d.tenantName}, friendly reminder: KES ${d.amountStr} rent for ${d.unitCode} is due ${d.dueDate}. Pay early: ${d.payLink} — Cornerstone`,

  REMINDER_DAY_5: (d) =>
    `Hi ${d.tenantName}, rent of KES ${d.amountStr} for ${d.unitCode} is due in ${d.daysLate} days (${d.dueDate}). Pay now: ${d.payLink} — Cornerstone`,

  DUE_TODAY: (d) =>
    `${d.tenantName}, your rent of KES ${d.amountStr} is DUE TODAY. Pay now to avoid late penalties: ${d.payLink} — Cornerstone`,

  ARREARS_DAY_11: (d) =>
    `OVERDUE: ${d.tenantName}, KES ${d.balanceStr} unpaid for ${d.unitCode}. A late penalty of KES 500/day has started. Pay now: ${d.payLink} — Cornerstone`,

  ARREARS_DAY_12: (d) =>
    `URGENT: ${d.tenantName}, KES ${d.balanceStr} still unpaid. Your deposit may be used if unpaid by 16th. Pay: ${d.payLink} — Cornerstone`,

  ARREARS_DAY_13: (d) =>
    `WARNING: ${d.tenantName}, KES ${d.balanceStr} overdue. Deposit depletion begins in 3 days. Settle now: ${d.payLink} — Cornerstone`,

  ARREARS_DAY_14: (d) =>
    `FINAL WARNING: ${d.tenantName}, KES ${d.balanceStr} overdue. Deposit depletion begins TOMORROW unless paid. Pay: ${d.payLink} — Cornerstone`,

  ARREARS_DAY_15: (d) =>
    `LAST CHANCE: ${d.tenantName}, KES ${d.balanceStr} overdue. Deposit will be used at midnight to cover arrears. Pay now: ${d.payLink} — Cornerstone`,

  DEPOSIT_WARNING: (d) =>
    `${d.tenantName}, your deposit of KES ${d.depositStr} is at risk. KES ${d.balanceStr} is overdue on ${d.unitCode}. Settle before 16th: ${d.payLink} — Cornerstone`,

  DEPOSIT_DEPLETED: (d) =>
    `${d.tenantName}, KES ${d.amountStr} has been deducted from your deposit for ${d.unitCode} to cover arrears. Deposit balance: KES ${d.depositStr}. Top up within 30 days. — Cornerstone`,

  PAYMENT_RECEIPT: (d) =>
    `RECEIVED: KES ${d.amountStr} from ${d.tenantName} for ${d.unitCode}. Ref: ${d.receiptNumber}. ${d.breakdown ? "Applied: " + d.breakdown + ". " : ""}Balance: KES ${d.balanceStr}. — Cornerstone`,

  INVITE_TENANT: (d) =>
    `Hi ${d.tenantName}, you've been invited to ${d.propertyName} Unit ${d.unitCode}. Set up your account: ${d.payLink} — Cornerstone`,

  WATER_READING_REQUEST: (d) =>
    `Hi ${d.tenantName}, please submit your water meter reading for ${d.unitCode}. Reply: WATER [reading] e.g. WATER 00543 — Cornerstone`,

  REFERRAL_DISCOUNT: (d) =>
    `Great news ${d.tenantName}! Your referral earned you a ${d.discountPct}% discount (KES ${fmt(d.discountAmount)}) on next month's rent. Code: ${d.referralCode} — Cornerstone`,

  PAYMENT_PLAN_APPROVED: (d) =>
    `${d.tenantName}, your payment plan for KES ${d.balanceStr} on ${d.unitCode} has been approved. First instalment due ${d.dueDate}. Pay: ${d.payLink} — Cornerstone`,

  DEPOSIT_TOP_UP: (d) =>
    `${d.tenantName}, your deposit on ${d.unitCode} needs topping up. Please pay KES ${d.amountStr} within 30 days. Pay: ${d.payLink} — Cornerstone`,

  EVICTION_NOTICE: (d) =>
    `LEGAL NOTICE: ${d.tenantName}, KES ${d.balanceStr} is outstanding on ${d.unitCode} for ${d.daysLate} days. Formal eviction proceedings have commenced. Contact your landlord immediately. — Cornerstone`,

  BALANCE_REPLY: (d) =>
    `${d.tenantName} — ${d.unitCode} balance: KES ${d.balanceStr} outstanding. Pay: ${d.payLink} — Cornerstone`,

  WATER_CONFIRM: (d) =>
    `Water reading ${d.waterReading} recorded for ${d.unitCode}. Bill: KES ${d.waterBillStr}. This will appear on your next invoice. — Cornerstone`,

  HELP_REPLY: (_d) =>
    `Cornerstone commands: BALANCE (check balance) | WATER [reading] (submit reading) | PAID (check payment). Support: 0800 100 100 — Cornerstone`,
};

// ─── Providers ────────────────────────────────────────────────────────────────

async function sendViaAfricasTalking(phone: string, message: string): Promise<string> {
  const body = new URLSearchParams({
    username: AT_USER,
    to: phone,
    message,
    from: AT_SENDER,
  });

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey: AT_KEY,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`AT error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const recipient = json.SMSMessageData?.Recipients?.[0];
  if (!recipient || recipient.status !== "Success") {
    throw new Error(`AT rejected: ${recipient?.statusCode ?? "unknown"}`);
  }
  return recipient.messageId;
}

async function sendViaSozuri(phone: string, message: string): Promise<string> {
  const res = await fetch("https://sozuri.net/api/v1/messaging/sms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SOZURI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: phone, message, from: SOZURI_FROM }),
  });

  if (!res.ok) throw new Error(`Sozuri error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.messageId ?? json.id ?? "sozuri-sent";
}

// ─── SMS Service ──────────────────────────────────────────────────────────────

interface SendOptions {
  phone: string;
  message?: string;                    // raw message (skip template)
  template?: SmsTemplateId;
  data?: TemplateData;
  organizationId?: string;
  tenantId?: string;
}

export const SMS = {
  /**
   * Send an SMS. Tries Africa's Talking first, falls back to Sozuri.
   * Logs every attempt to sms_logs table.
   */
  async send(opts: SendOptions): Promise<void> {
    const message =
      opts.message ??
      (opts.template && opts.data
        ? TEMPLATES[opts.template](opts.data)
        : "");

    if (!message) throw new Error("SMS: no message or template+data provided");

    // Create log entry
    const log = await db.smsLog.create({
      data: {
        phone: opts.phone,
        message,
        organizationId: opts.organizationId,
        tenantId: opts.tenantId,
        templateId: opts.template,
        provider: "AFRICAS_TALKING",
        status: "QUEUED",
      },
    });

    // Try Africa's Talking
    try {
      const externalId = await sendViaAfricasTalking(opts.phone, message);
      await db.smsLog.update({
        where: { id: log.id },
        data: { status: "SENT", externalId, sentAt: new Date() },
      });
      return;
    } catch (atErr) {
      console.warn("AT SMS failed:", atErr, "— falling back to Sozuri");
      await db.smsLog.update({
        where: { id: log.id },
        data: { provider: "SOZURI", retryCount: 1 },
      });
    }

    // Fallback: Sozuri
    try {
      const externalId = await sendViaSozuri(opts.phone, message);
      await db.smsLog.update({
        where: { id: log.id },
        data: { status: "SENT", externalId, sentAt: new Date() },
      });
    } catch (sozuriErr) {
      await db.smsLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          failureReason: String(sozuriErr),
          retryCount: 2,
        },
      });
      console.error("Both SMS providers failed for", opts.phone, sozuriErr);
      // Do not throw — SMS failure must never break the payment flow
    }
  },

  /**
   * Bulk send to multiple tenants (e.g. daily cadence).
   * Returns { sent, failed } counts.
   */
  async sendBulk(recipients: SendOptions[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      try {
        await SMS.send(r);
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  },

  /**
   * Parse an inbound two-way SMS command.
   */
  parseInbound(message: string): { command: string; args: string[] } {
    const parts = message.trim().toUpperCase().split(/\s+/);
    return { command: parts[0], args: parts.slice(1) };
  },

  /** Build a message from a named template */
  fromTemplate(id: SmsTemplateId, data: TemplateData): string {
    return TEMPLATES[id](data);
  },
};

export default SMS;
