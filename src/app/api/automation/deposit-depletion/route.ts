/**
 * n8n calls this endpoint on the 16th of each month at 00:01 AM.
 * Depletes deposits for overdue tenancies and sends urgent SMS alerts.
 */

import { NextRequest, NextResponse } from "next/server";
import { depleteDeposits } from "@/lib/late-fees";
import { SMS } from "@/lib/sms";
import { db } from "@/lib/db";

const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET!;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-automation-secret");
  if (secret !== AUTOMATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId } = await req.json().catch(() => ({}));

  try {
    const orgs = organizationId
      ? [{ id: organizationId }]
      : await db.organization.findMany({
          where: { subscriptionStatus: "ACTIVE" },
          select: { id: true },
        });

    const reports = [];

    for (const org of orgs) {
      const result = await depleteDeposits(org.id);
      reports.push({ organizationId: org.id, ...result });

      // SMS every depleted tenancy
      for (const leaseId of result.depleted) {
        const lease = await db.lease.findUnique({
          where: { id: leaseId },
          include: { tenant: true, unit: { include: { property: true } } },
        });
        if (!lease?.tenant.phone) continue;

        // Get updated deposit balance from ledger
        const depleted = await db.ledgerEntry.aggregate({
          where: { leaseId, type: "DEPOSIT_DEPLETION" },
          _sum: { amount: true },
        });
        const depositBalance = Math.max(0, lease.depositAmount - (depleted._sum.amount ?? 0));

        await SMS.send({
          phone: lease.tenant.phone,
          template: "DEPOSIT_DEPLETED",
          organizationId: org.id,
          tenantId: lease.tenantId,
          data: {
            tenantName: lease.tenant.firstName,
            unitCode: lease.unit.unitNumber,
            amountStr: (depleted._sum.amount ?? 0).toLocaleString("en-KE"),
            depositStr: depositBalance.toLocaleString("en-KE"),
            payLink: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${leaseId}`,
          },
        });

        // Notify landlord in-app
        await db.notification.create({
          data: {
            organizationId: org.id,
            title: `Deposit depleted — Unit ${lease.unit.unitNumber}`,
            message: `${lease.tenant.firstName} ${lease.tenant.lastName}'s deposit has been used to cover arrears. Deposit balance: KES ${depositBalance.toLocaleString("en-KE")}.`,
            type: "SYSTEM",
            channel: "IN_APP",
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      organizations: reports.length,
      totalDepleted: reports.reduce((s, r) => s + r.depleted, 0),
      reports,
    });
  } catch (err) {
    console.error("Deposit depletion automation error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
