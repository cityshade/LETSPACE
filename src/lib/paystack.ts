import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
});

// ─── Fee Calculator ───────────────────────────────────────────────────────────

export function calculatePlatformFee(
  amount: number,
  config: { platformFeeRate: number; platformFeeMin: number; platformFeeMax: number }
): number {
  const raw = (amount * config.platformFeeRate) / 100;
  return Math.round(Math.min(Math.max(raw, config.platformFeeMin), config.platformFeeMax));
}

// ─── Transaction Initialize ───────────────────────────────────────────────────

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  subaccountCode?: string;
  platformFee?: number;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}) {
  const amountKobo = Math.round(params.amount * 100);

  const payload: Record<string, any> = {
    email: params.email,
    amount: amountKobo,
    reference: params.reference,
    currency: "KES",
    callback_url:
      params.callbackUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/verify`,
    metadata: params.metadata || {},
  };

  if (params.subaccountCode) {
    payload.subaccount = params.subaccountCode;
    payload.transaction_charge = Math.round((params.platformFee || 0) * 100);
    payload.bearer = "subaccount"; // platform fee deducted from landlord's share
  }

  const { data } = await api.post("/transaction/initialize", payload);
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

// ─── Transaction Verify ───────────────────────────────────────────────────────

export async function verifyTransaction(reference: string) {
  const { data } = await api.get(`/transaction/verify/${reference}`);
  return data.data as {
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    metadata: Record<string, any>;
    subaccount?: { id: string; account_code: string };
    split?: { amount: number };
    fees?: number;
    id: number;
  };
}

// ─── Subaccount Management ────────────────────────────────────────────────────

export async function createSubaccount(params: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
  description?: string;
}) {
  const { data } = await api.post("/subaccount", {
    business_name: params.businessName,
    settlement_bank: params.bankCode,
    account_number: params.accountNumber,
    percentage_charge: params.percentageCharge,
    description: params.description || params.businessName,
  });
  return data.data as { id: number; subaccount_code: string; business_name: string };
}

export async function updateSubaccount(
  subaccountCode: string,
  params: { percentageCharge?: number; settlementBank?: string; accountNumber?: string }
) {
  const { data } = await api.put(`/subaccount/${subaccountCode}`, {
    ...(params.percentageCharge !== undefined && { percentage_charge: params.percentageCharge }),
    ...(params.settlementBank && { settlement_bank: params.settlementBank }),
    ...(params.accountNumber && { account_number: params.accountNumber }),
  });
  return data.data;
}

export async function listBanks() {
  const { data } = await api.get("/bank?country=kenya&currency=KES&per_page=100");
  return data.data as Array<{ name: string; code: string; longcode: string }>;
}

export async function resolveAccount(accountNumber: string, bankCode: string) {
  const { data } = await api.get(
    `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
  );
  return data.data as { account_number: string; account_name: string };
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!PAYSTACK_SECRET) return false;
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  return hash === signature;
}

// ─── Reference Generator ──────────────────────────────────────────────────────

export function generateReference(prefix = "LS"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
