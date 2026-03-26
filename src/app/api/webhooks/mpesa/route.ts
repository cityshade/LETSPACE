import { NextRequest, NextResponse } from "next/server";
import { parseMpesaCallback } from "@/lib/mpesa";
import { db } from "@/lib/db";

// M-Pesa STK Push Callback Endpoint
// Register at: https://api.safaricom.co.ke as your callback URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback:", JSON.stringify(body, null, 2));

    const callback = parseMpesaCallback(body);

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (callback.resultCode === 0 && callback.mpesaReceiptNumber) {
      // Payment was successful - find pending payment by checkoutRequestId
      const payment = await db.payment.findFirst({
        where: { reference: callback.checkoutRequestId },
        include: { invoice: true },
      });

      if (payment) {
        // Update payment record
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            mpesaReceiptNumber: callback.mpesaReceiptNumber,
            paidAt: new Date(),
          },
        });

        // Update invoice
        const newPaidAmount = payment.invoice.paidAmount + (callback.amount || 0);
        const newBalance = payment.invoice.totalAmount - newPaidAmount;
        const newStatus =
          newBalance <= 0 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "PENDING";

        await db.invoice.update({
          where: { id: payment.invoice.id },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: Math.max(0, newBalance),
            status: newStatus,
            paidDate: newStatus === "PAID" ? new Date() : undefined,
          },
        });

        // Create notification
        await db.notification.create({
          data: {
            organizationId: payment.invoice.organizationId,
            title: "Payment Received",
            message: `M-Pesa payment of KES ${callback.amount?.toLocaleString()} received. Receipt: ${callback.mpesaReceiptNumber}`,
            type: "PAYMENT_RECEIVED",
            channel: "IN_APP",
          },
        });
      }
    } else {
      // Payment failed - update status
      await db.payment.updateMany({
        where: { reference: callback.checkoutRequestId },
        data: { status: "FAILED" },
      });
    }

    // Always return success to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa webhook error:", error);
    // Still return success to prevent M-Pesa retry storms
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
