import { NextRequest, NextResponse } from "next/server";
import { createSubaccount, resolveAccount, listBanks } from "@/lib/paystack";
import { db } from "@/lib/db";

// GET /api/organizations/subaccount?organizationId=xxx — fetch banks list
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "banks") {
    const banks = await listBanks();
    return NextResponse.json({ data: banks });
  }

  if (action === "resolve") {
    const accountNumber = searchParams.get("accountNumber");
    const bankCode = searchParams.get("bankCode");
    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: "accountNumber and bankCode required" }, { status: 400 });
    }
    const resolved = await resolveAccount(accountNumber, bankCode);
    return NextResponse.json({ data: resolved });
  }

  return NextResponse.json({ error: "action required: banks | resolve" }, { status: 400 });
}

// POST /api/organizations/subaccount — create or update Paystack subaccount
export async function POST(req: NextRequest) {
  try {
    const { organizationId, bankCode, accountNumber, platformFeeRate } = await req.json();

    if (!organizationId || !bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "organizationId, bankCode, accountNumber required" },
        { status: 400 }
      );
    }

    const org = await db.organization.findUnique({ where: { id: organizationId } });
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const feeRate = platformFeeRate ?? org.platformFeeRate;
    const percentageCharge = 100 - feeRate; // subaccount gets remainder

    const subaccount = await createSubaccount({
      businessName: org.name,
      bankCode,
      accountNumber,
      percentageCharge,
      description: `LETSPACE — ${org.name}`,
    });

    const updated = await db.organization.update({
      where: { id: organizationId },
      data: {
        paystackSubaccountCode: subaccount.subaccount_code,
        payoutBankCode: bankCode,
        payoutAccountNumber: accountNumber,
        platformFeeRate: feeRate,
      },
    });

    return NextResponse.json({
      success: true,
      subaccountCode: subaccount.subaccount_code,
      platformFeeRate: feeRate,
      landlordShare: percentageCharge,
    });
  } catch (error: any) {
    console.error("Subaccount create error:", error?.response?.data || error.message);
    return NextResponse.json({ error: error?.response?.data?.message || error.message }, { status: 500 });
  }
}
