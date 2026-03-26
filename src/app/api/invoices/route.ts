import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";
import { z } from "zod";

const createInvoiceSchema = z.object({
  organizationId: z.string(),
  tenantId: z.string(),
  leaseId: z.string().optional(),
  unitId: z.string().optional(),
  type: z.enum(["RENT", "DEPOSIT", "SERVICE_CHARGE", "MAINTENANCE", "PENALTY", "OTHER"]),
  amount: z.number().positive(),
  vatRate: z.number().default(0),
  dueDate: z.string().datetime(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("organizationId");
  const status = searchParams.get("status");
  const tenantId = searchParams.get("tenantId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!orgId) {
    return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
  }

  const invoices = await db.invoice.findMany({
    where: {
      organizationId: orgId,
      ...(status && { status: status as any }),
      ...(tenantId && { tenantId }),
    },
    include: {
      tenant: { select: { firstName: true, lastName: true, phone: true } },
      unit: { select: { unitNumber: true, property: { select: { name: true } } } },
      payments: { select: { amount: true, method: true, status: true, paidAt: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.invoice.count({ where: { organizationId: orgId } });
  return NextResponse.json({ data: invoices, total, page, pageSize: limit });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { organizationId, amount, vatRate, ...rest } = parsed.data;
    const vatAmount = amount * (vatRate / 100);
    const totalAmount = amount + vatAmount;

    const invoice = await db.invoice.create({
      data: {
        organizationId,
        invoiceNumber: generateInvoiceNumber(),
        amount,
        vatAmount,
        totalAmount,
        balanceAmount: totalAmount,
        ...rest,
        dueDate: new Date(rest.dueDate),
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
