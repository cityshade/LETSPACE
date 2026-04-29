import { NextResponse } from "next/server";
import { startJob, finishJob } from "@/lib/cron-store";

export const dynamic = "force-dynamic";

export async function GET() {
  startJob("generate-invoices");

  try {
    const DEMO = process.env.DEMO_MODE === "true";

    if (DEMO) {
      const msg = "131 invoices generated for this billing cycle";
      finishJob("generate-invoices", msg, true);
      return NextResponse.json({ ok: true, message: msg });
    }

    // Production: generate invoices via DB
    finishJob("generate-invoices", "Invoice generation not yet wired to DB", true);
    return NextResponse.json({ ok: true });
  } catch (err) {
    finishJob("generate-invoices", String(err), false);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
