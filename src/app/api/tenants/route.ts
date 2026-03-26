import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createTenantSchema = z.object({
  organizationId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(9),
  nationalId: z.string().optional(),
  kraPin: z.string().optional(),
  employer: z.string().optional(),
  employerPhone: z.string().optional(),
  monthlyIncome: z.number().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("organizationId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!orgId) {
    return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
  }

  const tenants = await db.tenant.findMany({
    where: {
      organizationId: orgId,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { unit: { include: { property: true } } },
        take: 1,
      },
      _count: {
        select: { invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.tenant.count({
    where: { organizationId: orgId },
  });

  return NextResponse.json({ data: tenants, total, page, pageSize: limit });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const tenant = await db.tenant.create({ data: parsed.data });
    return NextResponse.json({ data: tenant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
