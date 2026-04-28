/**
 * n8n calls this endpoint daily at 8 AM.
 * Accrues late fees for all overdue leases per property config.
 * Protected by shared automation secret.
 */

import { NextRequest, NextResponse } from "next/server";
import { accrueLateFees } from "@/lib/late-fees";
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
    // Run for one org (if specified) or all active orgs
    const orgs = organizationId
      ? [{ id: organizationId }]
      : await db.organization.findMany({
          where: { subscriptionStatus: "ACTIVE" },
          select: { id: true },
        });

    const reports = [];

    for (const org of orgs) {
      const report = await accrueLateFees(org.id);
      reports.push({ organizationId: org.id, ...report });

      // SMS each tenant who received a penalty today
      for (const calc of report.results) {
        const lease = await db.lease.findUnique({
          where: { id: calc.leaseId },
          include: { tenant: true, unit: { include: { property: true } } },
        });
        if (!lease?.tenant.phone) continue;

        const dayOfMonth = new Date().getDate();

        await SMS.send({
          phone: lease.tenant.phone,
          template: dayOfMonth === 12 ? "ARREARS_DAY_12"
                  : dayOfMonth === 13 ? "ARREARS_DAY_13"
                  : dayOfMonth === 14 ? "ARREARS_DAY_14"
                  : dayOfMonth === 15 ? "ARREARS_DAY_15"
                  : "ARREARS_DAY_11",
          organizationId: calc.organizationId,
          tenantId: calc.tenantId,
          data: {
            tenantName: lease.tenant.firstName,
            unitCode: lease.unit.unitNumber,
            propertyName: lease.unit.property.name,
            balanceStr: calc.currentBalance.toLocaleString("en-KE"),
            daysLate: calc.daysLate,
            payLink: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${calc.leaseId}`,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      organizations: reports.length,
      totalPenalties: reports.reduce((s, r) => s + r.penaltiesPosted, 0),
      totalAmount: reports.reduce((s, r) => s + r.totalPenaltyAmount, 0),
      reports,
    });
  } catch (err) {
    console.error("Late fee automation error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
