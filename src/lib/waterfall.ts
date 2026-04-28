/**
 * Cornerstone Payment Waterfall Engine — Pillar 1
 *
 * When a tenant pays any amount, this engine allocates it across their
 * outstanding debt in configurable priority order:
 *   1. PENALTY   — late fees (oldest first)
 *   2. GARBAGE   — garbage collection charges
 *   3. WATER     — water bills
 *   4. SERVICE_CHARGE — service / maintenance levy
 *   5. RENT      — base rent
 *
 * Order is configurable per property. The engine returns a structured
 * allocation that the webhook handler uses to create ledger entries.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type WaterfallBucket =
  | "PENALTY"
  | "GARBAGE"
  | "WATER"
  | "SERVICE_CHARGE"
  | "RENT";

export interface TenantBalance {
  penalty: number;       // outstanding penalties
  garbage: number;       // outstanding garbage fee
  water: number;         // outstanding water bill
  serviceCharge: number; // outstanding service charge
  rent: number;          // outstanding rent
}

export interface WaterfallAllocation {
  bucket: WaterfallBucket;
  applied: number;       // amount allocated to this bucket
  cleared: boolean;      // true if this bucket is now fully settled
  remaining: number;     // remaining after this bucket
}

export interface WaterfallResult {
  totalReceived: number;
  allocations: WaterfallAllocation[];
  surplusCredit: number; // any overpayment (advance rent)
  totalApplied: number;
  ledgerCreditTypes: Record<WaterfallBucket, string>; // bucket → LedgerEntryType
}

// ─── Bucket → LedgerEntryType ─────────────────────────────────────────────────

const BUCKET_CREDIT_TYPE: Record<WaterfallBucket, string> = {
  PENALTY:        "LATE_PENALTY_PAYMENT",
  GARBAGE:        "GARBAGE_PAYMENT",
  WATER:          "WATER_PAYMENT",
  SERVICE_CHARGE: "SERVICE_CHARGE_PAYMENT",
  RENT:           "RENT_PAYMENT",
};

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Allocate `paymentAmount` across `balance` in `order`.
 * Returns the full allocation breakdown with ledger types.
 */
export function allocatePayment(
  paymentAmount: number,
  balance: TenantBalance,
  order: WaterfallBucket[] = ["PENALTY", "GARBAGE", "WATER", "SERVICE_CHARGE", "RENT"]
): WaterfallResult {
  let remaining = paymentAmount;
  const allocations: WaterfallAllocation[] = [];

  const bucketBalance: Record<WaterfallBucket, number> = {
    PENALTY:        balance.penalty,
    GARBAGE:        balance.garbage,
    WATER:          balance.water,
    SERVICE_CHARGE: balance.serviceCharge,
    RENT:           balance.rent,
  };

  for (const bucket of order) {
    if (remaining <= 0) break;

    const owed = bucketBalance[bucket];
    if (owed <= 0) continue;

    const applied = Math.min(remaining, owed);
    remaining -= applied;

    allocations.push({
      bucket,
      applied,
      cleared: applied >= owed,
      remaining,
    });
  }

  const totalApplied = paymentAmount - remaining;

  return {
    totalReceived: paymentAmount,
    allocations,
    surplusCredit: remaining,  // positive = overpayment
    totalApplied,
    ledgerCreditTypes: BUCKET_CREDIT_TYPE,
  };
}

/**
 * Build a human-readable waterfall summary for SMS receipts / audit logs.
 */
export function formatWaterfallSummary(result: WaterfallResult): string {
  const lines = result.allocations
    .filter((a) => a.applied > 0)
    .map((a) => {
      const label = {
        PENALTY:        "Late Penalty",
        GARBAGE:        "Garbage",
        WATER:          "Water",
        SERVICE_CHARGE: "Service Charge",
        RENT:           "Rent",
      }[a.bucket];
      return `${label}: KES ${a.applied.toLocaleString("en-KE")}`;
    });

  if (result.surplusCredit > 0) {
    lines.push(`Credit: KES ${result.surplusCredit.toLocaleString("en-KE")}`);
  }

  return lines.join(" | ");
}

/**
 * Calculate how much a tenant currently owes in total.
 */
export function totalOwed(balance: TenantBalance): number {
  return (
    balance.penalty +
    balance.garbage +
    balance.water +
    balance.serviceCharge +
    balance.rent
  );
}
