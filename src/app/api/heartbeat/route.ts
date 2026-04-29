import { NextResponse } from "next/server";
import { getJobs } from "@/lib/cron-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = getJobs();
  const allHealthy = jobs.every((j) => j.status !== "error");
  const anyRunning = jobs.some((j) => j.status === "running");

  return NextResponse.json({
    status: anyRunning ? "running" : allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    jobs,
  });
}
