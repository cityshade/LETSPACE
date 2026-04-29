import { NextResponse } from "next/server";
import { startJob, finishJob } from "@/lib/cron-store";

export const dynamic = "force-dynamic";

export async function GET() {
  startJob("sms-cadence");

  try {
    const DEMO = process.env.DEMO_MODE === "true";

    if (DEMO) {
      const today = new Date().getDate();
      const reminderDays = [3, 5, 10, 11, 12, 13, 14, 15, 16];
      const shouldRun = reminderDays.includes(today);
      const msg = shouldRun
        ? `8 SMS sent to overdue tenants (day ${today})`
        : `No reminders scheduled for day ${today}`;
      finishJob("sms-cadence", msg, true);
      return NextResponse.json({ ok: true, message: msg });
    }

    // Production: call the real automation endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/automation/sms-cadence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-automation-secret": process.env.AUTOMATION_SECRET!,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const msg = `${data.sent ?? 0} sent, ${data.skipped ?? 0} skipped`;
    finishJob("sms-cadence", msg, data.ok);
    return NextResponse.json({ ok: data.ok, message: msg });
  } catch (err) {
    finishJob("sms-cadence", String(err), false);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
