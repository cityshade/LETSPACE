import { NextRequest, NextResponse } from "next/server";
import { generatePropertyDescription } from "@/lib/ai/claude";

export async function POST(req: NextRequest) {
  try {
    const { property, organizationId } = await req.json();

    const description = await generatePropertyDescription(property, {
      organizationId,
      feature: "property_description",
    });

    return NextResponse.json({ description });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
