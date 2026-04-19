// LETSPACE - Safaricom M-Pesa Daraja API Integration
// Supports STK Push, C2B, B2C, and Transaction Status

import axios from "axios";

const MPESA_BASE_URL =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORTCODE = process.env.MPESA_SHORTCODE!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

// ─── OAuth Token ──────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );

  cachedToken = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

// ─── STK Push (Lipa na M-Pesa Online) ────────────────────────────────────────

export interface STKPushParams {
  phoneNumber: string; // Format: 2547XXXXXXXX
  amount: number;
  accountReference: string; // Invoice/Lease number
  transactionDesc: string;
  callbackUrl?: string;
}

export interface STKPushResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  customerMessage?: string;
  error?: string;
}

export async function initiateStkPush(params: STKPushParams): Promise<STKPushResponse> {
  try {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

    // Normalize phone number
    const phone = normalizeKenyanPhone(params.phoneNumber);

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(params.amount),
        PartyA: phone,
        PartyB: SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: params.callbackUrl || CALLBACK_URL,
        AccountReference: params.accountReference.slice(0, 12),
        TransactionDesc: params.transactionDesc.slice(0, 13),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      success: response.data.ResponseCode === "0",
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      customerMessage: response.data.CustomerMessage,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.errorMessage || error.message,
    };
  }
}

// ─── STK Query (Check Payment Status) ────────────────────────────────────────

export async function queryStkStatus(checkoutRequestId: string): Promise<{
  status: "pending" | "completed" | "failed";
  resultCode?: string;
  resultDesc?: string;
}> {
  try {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const resultCode = response.data.ResultCode;
    return {
      status: resultCode === "0" ? "completed" : resultCode === "1032" ? "pending" : "failed",
      resultCode: String(resultCode),
      resultDesc: response.data.ResultDesc,
    };
  } catch {
    return { status: "pending" };
  }
}

// ─── B2C (Business to Customer - Refunds) ────────────────────────────────────

export async function sendB2CPayment(params: {
  phoneNumber: string;
  amount: number;
  remarks: string;
  initiatorName: string;
  securityCredential: string;
}) {
  const token = await getAccessToken();

  return axios.post(
    `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
    {
      InitiatorName: params.initiatorName,
      SecurityCredential: params.securityCredential,
      CommandID: "BusinessPayment",
      Amount: Math.round(params.amount),
      PartyA: SHORTCODE,
      PartyB: normalizeKenyanPhone(params.phoneNumber),
      Remarks: params.remarks.slice(0, 100),
      QueueTimeOutURL: `${CALLBACK_URL}/timeout`,
      ResultURL: `${CALLBACK_URL}/result`,
      Occasion: "",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// ─── Webhook Payload Parser ───────────────────────────────────────────────────

export interface MpesaCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

export function parseMpesaCallback(body: any): MpesaCallbackData | null {
  try {
    const stk = body?.Body?.stkCallback;
    if (!stk) return null;

    const metadata = stk.CallbackMetadata?.Item || [];
    const getValue = (name: string) =>
      metadata.find((i: any) => i.Name === name)?.Value;

    return {
      merchantRequestId: stk.MerchantRequestID,
      checkoutRequestId: stk.CheckoutRequestID,
      resultCode: stk.ResultCode,
      resultDesc: stk.ResultDesc,
      amount: getValue("Amount"),
      mpesaReceiptNumber: getValue("MpesaReceiptNumber"),
      transactionDate: getValue("TransactionDate"),
      phoneNumber: getValue("PhoneNumber"),
    };
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("7") || cleaned.startsWith("1")) return "254" + cleaned;
  if (cleaned.startsWith("254")) return cleaned;
  return cleaned;
}

export function formatMpesaAmount(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}
