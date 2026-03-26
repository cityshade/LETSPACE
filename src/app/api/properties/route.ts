import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createPropertySchema = z.object({
  organizationId: z.string(),
  name: z.string().min(2).max(100),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "MIXED_USE", "LAND"]),
  category: z.enum(["APARTMENT", "HOUSE", "VILLA", "BEDSITTER", "STUDIO", "TOWNHOUSE", "MAISONETTE", "BUNGALOW", "OFFICE", "RETAIL", "WAREHOUSE", "LAND"]),
  address: z.string().min(5),
  city: z.string(),
  county: z.string(),
  description: z.string().optional(),
  landReference: z.string().optional(),
  titleDeedNumber: z.string().optional(),
  yearBuilt: z.number().optional(),
  managementFee: z.number().optional(),
  serviceCharge: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  nearbyFacilities: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("organizationId");
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!orgId) {
    return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
  }

  const properties = await db.property.findMany({
    where: {
      organizationId: orgId,
      ...(status && { status: status as any }),
      ...(city && { city }),
    },
    include: {
      units: {
        select: { id: true, status: true, rentAmount: true },
      },
      _count: {
        select: { units: true, maintenanceRequests: true, leads: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.property.count({
    where: { organizationId: orgId },
  });

  return NextResponse.json({
    data: properties,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { organizationId, name, ...rest } = parsed.data;

    // Generate unique slug
    let slug = slugify(name);
    const existing = await db.property.findFirst({
      where: { organizationId, slug },
    });
    if (existing) slug = `${slug}-${Date.now()}`;

    const property = await db.property.create({
      data: {
        organizationId,
        name,
        slug,
        ...rest,
        amenities: rest.amenities || [],
        nearbyFacilities: rest.nearbyFacilities || [],
      },
    });

    return NextResponse.json({ data: property }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
