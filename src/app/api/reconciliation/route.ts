import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("organizationId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!orgId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const where = {
    organizationId: orgId,
    ...(from || to
      ? {
          processedAt: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  };

  const [records, total, summary, monthlySummary] = await Promise.all([
    db.reconciliation.findMany({
      where,
      orderBy: { processedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.reconciliation.count({ where }),
    db.reconciliation.aggregate({
      where: { organizationId: orgId, status: "COMPLETED" },
      _sum: { totalAmount: true, platformFee: true, landlordAmount: true },
      _count: { id: true },
    }),
    // This month's summary
    db.reconciliation.aggregate({
      where: {
        organizationId: orgId,
        status: "COMPLETED",
        processedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalAmount: true, platformFee: true, landlordAmount: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    data: records,
    total,
    page,
    pageSize: limit,
    summary: {
      allTime: {
        totalCollected: summary._sum.totalAmount ?? 0,
        platformFees: summary._sum.platformFee ?? 0,
        netToLandlords: summary._sum.landlordAmount ?? 0,
        transactions: summary._count.id,
      },
      thisMonth: {
        totalCollected: monthlySummary._sum.totalAmount ?? 0,
        platformFees: monthlySummary._sum.platformFee ?? 0,
        netToLandlords: monthlySummary._sum.landlordAmount ?? 0,
        transactions: monthlySummary._count.id,
      },
    },
  });
}
