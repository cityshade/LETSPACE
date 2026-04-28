/**
 * Cornerstone Late Fee Engine — Pillar 2 + Pillar 4
 *
 * Calculates, accrues, and splits late penalties per property configuration.
 * Called by n8n daily automation at 8 AM.
 *
 * Rules are per-property (PropertyConfig). All fees post to the immutable ledger.
 * Agent and landlord splits are recorded on every penalty entry.
 */

import { db } from "@/lib/db";
import { LedgerService } from "@/lib/ledger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PenaltyCalculation {
  leaseId: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  organizationId: string;

  daysLate: number;
  baseRent: number;
  currentBalance: number;       // what the tenant currently owes (incl. prev penalties)
  newPenalty: number;           // today's penalty amount
  capped: boolean;              // true if cap was applied
  agentShare: number;
  landlordShare: number;
  platformShare: number;        // Cornerstone never takes from penalties = 0
}

// ─── Calculator ───────────────────────────────────────────────────────────────

interface LateFeeConfig {
  lateFeeEnabled: boolean;
  lateFeeDueDay: number;
  lateFeeGraceDays: number;
  lateFeeType: string;
  lateFeeAmount: number;
  lateFeeCapEnabled: boolean;
  lateFeeCapType: string;
  lateFeeCapValue: number;
  lateFeeAgentSplit: number;
  lateFeeLandlordSplit: number;
}

export function calculatePenalty(
  rentAmount: number,
  daysLate: number,
  totalAccruedSoFar: number, // total penalties already charged this month
  config: LateFeeConfig
): { penalty: number; capped: boolean } {
  if (!config.lateFeeEnabled || daysLate <= config.lateFeeGraceDays) {
    return { penalty: 0, capped: false };
  }

  const effectiveDaysLate = daysLate - config.lateFeeGraceDays;

  let penalty = 0;

  switch (config.lateFeeType) {
    case "FIXED_PER_DAY":
      penalty = config.lateFeeAmount;
      break;

    case "PERCENTAGE_ONCE":
      // One-time % on first late day only
      penalty = effectiveDaysLate === 1
        ? (rentAmount * config.lateFeeAmount) / 100
        : 0;
      break;

    case "PERCENTAGE_PER_DAY":
      penalty = (rentAmount * config.lateFeeAmount) / 100;
      break;

    case "COMPOUND":
      // Compounds: today's penalty = previous total × rate
      penalty = totalAccruedSoFar > 0
        ? totalAccruedSoFar * (config.lateFeeAmount / 100)
        : config.lateFeeAmount; // seed with flat amount on day 1
      break;

    default:
      penalty = config.lateFeeAmount;
  }

  if (penalty === 0) return { penalty: 0, capped: false };

  // Apply cap
  if (config.lateFeeCapEnabled) {
    const cap =
      config.lateFeeCapType === "PERCENTAGE"
        ? (rentAmount * config.lateFeeCapValue) / 100
        : config.lateFeeCapValue;

    const projectedTotal = totalAccruedSoFar + penalty;
    if (projectedTotal > cap) {
      const cappedPenalty = Math.max(0, cap - totalAccruedSoFar);
      return { penalty: Math.round(cappedPenalty * 100) / 100, capped: true };
    }
  }

  return { penalty: Math.round(penalty * 100) / 100, capped: false };
}

// ─── Daily Accrual Engine ─────────────────────────────────────────────────────

/**
 * Process late fees for all overdue leases in an organisation.
 * Designed to be called by n8n cron at 8 AM daily.
 *
 * Returns a report of what was charged.
 */
export async function accrueLateFees(organizationId: string) {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Fetch all active leases with their config and current ledger balance
  const leases = await db.lease.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    include: {
      unit: { include: { property: true } },
      tenant: true,
    },
  });

  const results: PenaltyCalculation[] = [];
  const errors: { leaseId: string; error: string }[] = [];

  for (const lease of leases) {
    try {
      // Get property config (fall back to safe defaults)
      const config = await db.propertyConfig.findUnique({
        where: { propertyId: lease.unit.propertyId },
      });

      const cfg: LateFeeConfig = {
        lateFeeEnabled:       config?.lateFeeEnabled      ?? true,
        lateFeeDueDay:        config?.lateFeeDueDay       ?? lease.paymentDueDay ?? 10,
        lateFeeGraceDays:     config?.lateFeeGraceDays    ?? lease.gracePeriodDays ?? 0,
        lateFeeType:          config?.lateFeeType         ?? "FIXED_PER_DAY",
        lateFeeAmount:        config?.lateFeeAmount       ?? 500,
        lateFeeCapEnabled:    config?.lateFeeCapEnabled   ?? false,
        lateFeeCapType:       config?.lateFeeCapType      ?? "AMOUNT",
        lateFeeCapValue:      config?.lateFeeCapValue     ?? 10000,
        lateFeeAgentSplit:    config?.lateFeeAgentSplit   ?? 50,
        lateFeeLandlordSplit: config?.lateFeeLandlordSplit ?? 50,
      };

      if (!cfg.lateFeeEnabled) continue;

      // Calculate days late
      const dueDay = cfg.lateFeeDueDay;
      let daysLate = dayOfMonth - dueDay;

      // Handle month wrap (if before due day → no late fee yet)
      if (daysLate <= 0) continue;

      // Check if rent is actually paid (check ledger balance for this month)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const rentPaidThisMonth = await db.ledgerEntry.aggregate({
        where: {
          leaseId: lease.id,
          type: "RENT_PAYMENT",
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      });

      const rentCharged = lease.rentAmount;
      const rentPaid = rentPaidThisMonth._sum.amount ?? 0;
      if (rentPaid >= rentCharged) continue; // fully paid — no penalty

      // Get penalties already accrued this month
      const penaltiesThisMonth = await db.ledgerEntry.aggregate({
        where: {
          leaseId: lease.id,
          type: "LATE_PENALTY",
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      });

      const totalAccruedSoFar = penaltiesThisMonth._sum.amount ?? 0;

      // Check if penalty already posted today
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const alreadyPostedToday = await db.ledgerEntry.count({
        where: {
          leaseId: lease.id,
          type: "LATE_PENALTY",
          penaltyDay: dayOfMonth,
          createdAt: { gte: todayStart },
        },
      });

      if (alreadyPostedToday > 0) continue; // idempotent

      // Calculate penalty
      const currentBalance = await db.ledgerEntry.findFirst({
        where: { leaseId: lease.id },
        orderBy: { createdAt: "desc" },
        select: { runningBalance: true },
      });

      const { penalty, capped } = calculatePenalty(
        rentCharged,
        daysLate,
        totalAccruedSoFar,
        cfg
      );

      if (penalty <= 0) continue;

      // Split (Cornerstone never takes from penalties)
      const agentShare    = Math.round((penalty * cfg.lateFeeAgentSplit) / 100 * 100) / 100;
      const landlordShare = Math.round((penalty * cfg.lateFeeLandlordSplit) / 100 * 100) / 100;

      // Post to ledger
      await LedgerService.debit({
        organizationId,
        leaseId: lease.id,
        tenantId: lease.tenantId,
        unitId: lease.unitId,
        propertyId: lease.unit.propertyId,
        type: "LATE_PENALTY",
        component: "PENALTY",
        amount: penalty,
        description: `Late penalty — Day ${daysLate} (${today.toLocaleDateString("en-KE")})`,
        agentShare,
        landlordShare,
        platformShare: 0,
        penaltyDay: dayOfMonth,
        gracePeriodDays: cfg.lateFeeGraceDays,
      });

      // Record agent commission
      if (agentShare > 0) {
        // Find agent membership for this property
        const agentMember = await db.organizationUser.findFirst({
          where: { organizationId, role: { in: ["AGENT", "MANAGER"] }, isActive: true },
        });
        if (agentMember) {
          await db.agentCommission.create({
            data: {
              organizationId,
              agentUserId: agentMember.userId,
              landlordOrgId: organizationId,
              propertyId: lease.unit.propertyId,
              unitId: lease.unitId,
              leaseId: lease.id,
              commissionType: "LATE_FEE_SHARE",
              grossAmount: penalty,
              commissionPct: cfg.lateFeeAgentSplit,
              commissionAmount: agentShare,
              status: "PENDING",
            },
          });
        }
      }

      results.push({
        leaseId: lease.id,
        tenantId: lease.tenantId,
        unitId: lease.unitId,
        propertyId: lease.unit.propertyId,
        organizationId,
        daysLate,
        baseRent: rentCharged,
        currentBalance: currentBalance?.runningBalance ?? 0,
        newPenalty: penalty,
        capped,
        agentShare,
        landlordShare,
        platformShare: 0,
      });
    } catch (err) {
      errors.push({ leaseId: lease.id, error: String(err) });
    }
  }

  return {
    processed: leases.length,
    penaltiesPosted: results.length,
    totalPenaltyAmount: results.reduce((s, r) => s + r.newPenalty, 0),
    results,
    errors,
  };
}

// ─── Deposit Depletion Engine ─────────────────────────────────────────────────

/**
 * Called on Day 16 (00:01 AM) by n8n.
 * For each overdue tenancy with deposit depletion enabled:
 * - deducts from deposit to cover arrears (up to depositDepletionMaxPct)
 * - posts immutable ledger entries
 * - starts 30-day top-up timer
 */
export async function depleteDeposits(organizationId: string) {
  const depleted: string[] = [];
  const errors: { leaseId: string; error: string }[] = [];

  const leases = await db.lease.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: { unit: true, tenant: true },
  });

  for (const lease of leases) {
    try {
      const config = await db.propertyConfig.findUnique({
        where: { propertyId: lease.unit.propertyId },
      });

      if (!(config?.depositDepletionEnabled ?? true)) continue;

      const maxPct = config?.depositDepletionMaxPct ?? 100;

      // Get current ledger balance (positive = owes)
      const ledger = await db.ledgerEntry.findFirst({
        where: { leaseId: lease.id },
        orderBy: { createdAt: "desc" },
        select: { runningBalance: true },
      });

      const balance = ledger?.runningBalance ?? 0;
      if (balance <= 0) continue; // fully paid

      // Check deposit available
      const depositPaidEntry = await db.ledgerEntry.findFirst({
        where: { leaseId: lease.id, type: "DEPOSIT_PAYMENT" },
        orderBy: { createdAt: "asc" },
        select: { amount: true },
      });

      const depositPaid = depositPaidEntry?.amount ?? lease.depositPaid;
      const maxDeductable = (depositPaid * maxPct) / 100;

      // Check what's already been depleted
      const alreadyDepleted = await db.ledgerEntry.aggregate({
        where: { leaseId: lease.id, type: "DEPOSIT_DEPLETION" },
        _sum: { amount: true },
      });

      const availableDeposit = maxDeductable - (alreadyDepleted._sum.amount ?? 0);
      if (availableDeposit <= 0) continue;

      const deductAmount = Math.min(balance, availableDeposit);

      await LedgerService.credit({
        organizationId,
        leaseId: lease.id,
        tenantId: lease.tenantId,
        unitId: lease.unitId,
        propertyId: lease.unit.propertyId,
        type: "DEPOSIT_DEPLETION",
        amount: deductAmount,
        description: `Deposit depletion — arrears KES ${balance.toLocaleString("en-KE")}`,
        reference: `DEP-DEPLETION-${new Date().toISOString().slice(0, 10)}`,
      });

      depleted.push(lease.id);
    } catch (err) {
      errors.push({ leaseId: lease.id, error: String(err) });
    }
  }

  return { depleted: depleted.length, errors };
}
