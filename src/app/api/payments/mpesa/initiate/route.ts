import { NextRequest, NextResponse } from "next/server";
import { initiateStkPush } from "@/lib/mpesa";
import { db } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, phoneNumber } = await req.json();

    if (!invoiceId || !phoneNumber) {
      return NextResponse.json(
        { error: "Invoice ID and phone number are required" },
        { status: 400 }
      );
    }

    // Fetch invoice
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { tenant: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    const amountDue = invoice.balanceAmount;

    // Initiate STK Push
    const result = await initiateStkPush({
      phoneNumber,
      amount: amountDue,
      accountReference: invoice.invoiceNumber,
      transactionDesc: `Rent ${invoice.invoiceNumber}`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Create pending payment record
    await db.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: amountDue,
        currency: "KES",
        method: "MPESA",
        reference: result.checkoutRequestId,
        mpesaPhone: phoneNumber,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.checkoutRequestId,
      message: result.customerMessage,
    });
  } catch (error: any) {
    console.error("M-Pesa initiation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
