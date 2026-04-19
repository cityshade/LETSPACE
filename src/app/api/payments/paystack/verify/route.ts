import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction, calculatePlatformFee } from "@/lib/paystack";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  try {
    const tx = await verifyTransaction(reference);

    if (tx.status === "success") {
      const payment = await db.payment.findFirst({
        where: { reference },
        include: {
          invoice: { include: { organization: true, tenant: true } },
        },
      });

      if (payment && payment.status !== "COMPLETED") {
        const org = payment.invoice.organization;
        const amountKES = tx.amount / 100;
        const platformFee = calculatePlatformFee(amountKES, org);
        const landlordAmount = amountKES - platformFee;

        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date(tx.paid_at),
            paystackRef: String(tx.id),
            platformFee,
            landlordAmount,
            feeRate: org.platformFeeRate,
            isReconciled: true,
            reconciledAt: new Date(),
          },
        });

        const newPaid = payment.invoice.paidAmount + amountKES;
        const newBalance = payment.invoice.totalAmount - newPaid;

        await db.invoice.update({
          where: { id: payment.invoice.id },
          data: {
            paidAmount: newPaid,
            balanceAmount: Math.max(0, newBalance),
            status: newBalance <= 0 ? "PAID" : "PARTIAL",
            paidDate: newBalance <= 0 ? new Date() : undefined,
          },
        });

        // Upsert reconciliation (webhook may have already created it)
        await db.reconciliation.upsert({
          where: { paymentId: payment.id },
          update: { status: "COMPLETED" },
          create: {
            organizationId: org.id,
            paymentId: payment.id,
            invoiceId: payment.invoice.id,
            tenantName: `${payment.invoice.tenant.firstName} ${payment.invoice.tenant.lastName}`,
            propertyUnit: "N/A",
            totalAmount: amountKES,
            platformFee,
            landlordAmount,
            feeRate: org.platformFeeRate,
            paystackRef: reference,
            status: "COMPLETED",
          },
        });
      }
    }

    return NextResponse.redirect(
      new URL(`/dashboard/financials/invoices?payment=${tx.status}`, req.url)
    );
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.redirect(new URL("/dashboard/financials/invoices?payment=error", req.url));
  }
}
