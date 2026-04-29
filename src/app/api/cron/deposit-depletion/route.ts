import { NextResponse } from "next/server";
import { startJob, finishJob } from "@/lib/cron-store";

export const dynamic = "force-dynamic";

export async function GET() {
  startJob("deposit-depletion");

  try {
    const DEMO = process.env.DEMO_MODE === "true";

    if (DEMO) {
      const msg = "2 deposits depleted · KES 60,000 recovered";
      finishJob("deposit-depletion", msg, true);
      return NextResponse.json({ ok: true, message: msg });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/deposit-depletion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-automation-secret": process.env.AUTOMATION_SECRET!,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const msg = `${data.totalDepleted ?? 0} deposits depleted`;
    finishJob("deposit-depletion", msg, data.ok);
    return NextResponse.json({ ok: data.ok, message: msg });
  } catch (err) {
    finishJob("deposit-depletion", String(err), false);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
