import { NextRequest, NextResponse } from "next/server";
import {
  initializeTransaction,
  calculatePlatformFee,
  generateReference,
} from "@/lib/paystack";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, tenantEmail } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { organization: true, tenant: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    const org = invoice.organization;
    const amount = invoice.balanceAmount;
    const platformFee = calculatePlatformFee(amount, org);
    const landlordAmount = amount - platformFee;
    const reference = generateReference("LS");

    const email =
      tenantEmail ||
      invoice.tenant.email ||
      `tenant-${invoice.tenantId}@letspace.app`;

    const tx = await initializeTransaction({
      email,
      amount,
      reference,
      subaccountCode: org.paystackSubaccountCode ?? undefined,
      platformFee,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        organizationId: org.id,
        tenantId: invoice.tenantId,
        platformFee,
        landlordAmount,
      },
    });

    // Create pending payment with pre-calculated split
    await db.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        method: "CARD",
        reference,
        platformFee,
        landlordAmount,
        feeRate: org.platformFeeRate,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: tx.authorization_url,
      reference,
      split: {
        total: amount,
        platformFee,
        landlordAmount,
        feeRate: org.platformFeeRate,
      },
    });
  } catch (error: any) {
    console.error("Paystack initiate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
