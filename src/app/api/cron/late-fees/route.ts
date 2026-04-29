import { NextResponse } from "next/server";
import { startJob, finishJob } from "@/lib/cron-store";

export const dynamic = "force-dynamic";

export async function GET() {
  startJob("late-fees");

  try {
    const DEMO = process.env.DEMO_MODE === "true";

    if (DEMO) {
      const today = new Date().getDate();
      if (today < 11) {
        finishJob("late-fees", "No penalties due before day 11", true);
        return NextResponse.json({ ok: true, message: "No penalties due today" });
      }
      const msg = `3 late fee penalties posted · KES 4,500`;
      finishJob("late-fees", msg, true);
      return NextResponse.json({ ok: true, message: msg });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/late-fees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-automation-secret": process.env.AUTOMATION_SECRET!,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const msg = `${data.totalPenalties ?? 0} penalties · KES ${(data.totalAmount ?? 0).toLocaleString("en-KE")}`;
    finishJob("late-fees", msg, data.ok);
    return NextResponse.json({ ok: data.ok, message: msg });
  } catch (err) {
    finishJob("late-fees", String(err), false);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
