/**
 * Cornerstone Commission & Revenue Engine — Pillar 4 (Max Revenue)
 *
 * Tracks and calculates all revenue streams:
 *   - Platform fees (Cornerstone's 10% cut of rent via Paystack split)
 *   - Agent commissions (% of rent + late fee share)
 *   - Referral discounts (tenant referral programme)
 *
 * All numbers feed the revenue dashboard and monthly statements.
 */

import { db } from "@/lib/db";

// ─── Platform fee calculator ──────────────────────────────────────────────────

const DEFAULT_PLATFORM_PCT = 10; // 10% of rent goes to Cornerstone
const DEFAULT_AGENT_PCT    = 0;  // 0% default (set per org/property)

interface SplitConfig {
  platformPct?: number;    // Cornerstone's cut (default 10%)
  agentPct?: number;       // Agent commission (default 0, set per org)
  lateFeeAgentPct?: number;
  lateFeeLandlordPct?: number;
}

export interface RevenueSplit {
  grossAmount: number;
  platformFee: number;    // Cornerstone revenue
  agentCommission: number;
  landlordNet: number;    // what landlord actually receives
}

/**
 * Calculate the 3-way revenue split on a rent payment.
 * Platform fee is deducted first (via Paystack subaccount percentage_charge).
 * Agent commission is then deducted from landlord's share.
 */
export function calculateRevenueSplit(
  grossAmount: number,
  config: SplitConfig = {}
): RevenueSplit {
  const platformPct = config.platformPct ?? DEFAULT_PLATFORM_PCT;
  const agentPct    = config.agentPct    ?? DEFAULT_AGENT_PCT;

  const platformFee       = Math.round(grossAmount * platformPct / 100 * 100) / 100;
  const afterPlatform     = grossAmount - platformFee;
  const agentCommission   = Math.round(afterPlatform * agentPct / 100 * 100) / 100;
  const landlordNet       = afterPlatform - agentCommission;

  return { grossAmount, platformFee, agentCommission, landlordNet };
}

// ─── Agent commission recording ───────────────────────────────────────────────

export async function recordRentCommission(params: {
  organizationId: string;
  agentUserId: string;
  propertyId: string;
  unitId: string;
  leaseId: string;
  grossRent: number;
  commissionPct: number;
  ledgerEntryId?: string;
}) {
  const commissionAmount = Math.round(params.grossRent * params.commissionPct / 100 * 100) / 100;
  if (commissionAmount <= 0) return null;

  return db.agentCommission.create({
    data: {
      organizationId: params.organizationId,
      agentUserId: params.agentUserId,
      landlordOrgId: params.organizationId,
      propertyId: params.propertyId,
      unitId: params.unitId,
      leaseId: params.leaseId,
      ledgerEntryId: params.ledgerEntryId,
      commissionType: "RENT_COMMISSION",
      grossAmount: params.grossRent,
      commissionPct: params.commissionPct,
      commissionAmount,
      status: "PENDING",
    },
  });
}

// ─── Referral system ──────────────────────────────────────────────────────────

// Tier table: 1st = 5%, 2nd = 10%, 3rd = 15%, 4th = 20%, 5th+ = 25%
const REFERRAL_TIERS = [5, 10, 15, 20, 25];

export function referralDiscountPct(timesReferred: number): number {
  const idx = Math.min(timesReferred - 1, REFERRAL_TIERS.length - 1);
  return REFERRAL_TIERS[Math.max(0, idx)];
}

/**
 * Generate a unique referral code for a new tenant.
 * Format: FIRST-LASTINITIAL-UNIT (e.g. MARY-W-4B)
 */
export function buildReferralCode(firstName: string, lastName: string, unitNumber: string): string {
  const first = firstName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  const lastI = lastName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
  const unit  = unitNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${first}-${lastI}-${unit}`;
}

/**
 * Process a referral conversion after the referred tenant's first rent payment.
 * Awards the referrer their tiered discount.
 */
export async function processReferralConversion(params: {
  referralCode: string;
  referredTenantId: string;
  referredLeaseId: string;
  rentAmount: number;
}) {
  const code = await db.referralCode.findUnique({
    where: { code: params.referralCode },
  });
  if (!code) return null;

  const newTimesUsed  = code.timesUsed + 1;
  const discountPct   = referralDiscountPct(newTimesUsed);
  const discountAmount = Math.round(params.rentAmount * discountPct / 100 * 100) / 100;

  // Create conversion record
  const conversion = await db.referralConversion.create({
    data: {
      referralCodeId: code.id,
      referredTenantId: params.referredTenantId,
      referredLeaseId: params.referredLeaseId,
      discountPct,
      discountAmount,
      status: "EARNED",
    },
  });

  // Update referral code tier
  await db.referralCode.update({
    where: { id: code.id },
    data: { timesUsed: newTimesUsed, discountTier: newTimesUsed },
  });

  return { conversion, discountPct, discountAmount };
}

// ─── Revenue dashboard data ───────────────────────────────────────────────────

export async function getRevenueSummary(organizationId: string, months = 12) {
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - months);

  const [
    platformRevenue,
    agentCommissions,
    referralSavings,
    totalRentProcessed,
  ] = await Promise.all([
    // Platform fees (from reconciliation records)
    db.reconciliation.aggregate({
      where: { organizationId, createdAt: { gte: fromDate } },
      _sum: { platformFee: true, totalAmount: true },
    }),

    // Agent commissions earned
    db.agentCommission.aggregate({
      where: { organizationId, createdAt: { gte: fromDate } },
      _sum: { commissionAmount: true },
      _count: { id: true },
    }),

    // Referral discounts given (cost to landlord vs agent savings)
    db.referralConversion.aggregate({
      where: { createdAt: { gte: fromDate }, status: "EARNED" },
      _sum: { discountAmount: true },
      _count: { id: true },
    }),

    // Total rent flows through Cornerstone
    db.reconciliation.aggregate({
      where: { organizationId, createdAt: { gte: fromDate }, status: "COMPLETED" },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
  ]);

  return {
    period: `Last ${months} months`,
    totalRentProcessed: totalRentProcessed._sum.totalAmount ?? 0,
    transactions: totalRentProcessed._count.id,

    cornerstoneRevenue: {
      platformFees: platformRevenue._sum.platformFee ?? 0,
      pct: DEFAULT_PLATFORM_PCT,
    },

    agentRevenue: {
      totalCommissions: agentCommissions._sum.commissionAmount ?? 0,
      transactions: agentCommissions._count.id,
    },

    referralProgram: {
      totalDiscountsGiven: referralSavings._sum.discountAmount ?? 0,
      conversions: referralSavings._count.id,
    },
  };
}

/**
 * Get monthly breakdown of rent collected vs platform fee earned.
 * Returns array of { month, rentCollected, platformFee, transactions }.
 */
export async function getMonthlyRevenueChart(organizationId: string, months = 6) {
  const rows = await db.$queryRaw<Array<{
    month: string;
    rent_collected: number;
    platform_fee: number;
    transactions: number;
  }>>`
    SELECT
      TO_CHAR(created_at, 'YYYY-MM') as month,
      SUM(total_amount)::float as rent_collected,
      SUM(platform_fee)::float as platform_fee,
      COUNT(*)::int as transactions
    FROM reconciliations
    WHERE organization_id = ${organizationId}
      AND created_at >= NOW() - INTERVAL '${months} months'
      AND status = 'COMPLETED'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month ASC
  `;

  return rows.map((r) => ({
    month: r.month,
    rentCollected: Number(r.rent_collected),
    platformFee: Number(r.platform_fee),
    transactions: Number(r.transactions),
  }));
}
