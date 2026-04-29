/**
 * Cornerstone Cron Store
 * Tracks automation job execution state.
 * Module-level map persists across requests in the same serverless instance.
 * In production: back with Redis or a DB table.
 */

export type JobStatus = "success" | "error" | "running" | "never";

export interface CronJob {
  id: string;
  name: string;
  schedule: string;          // cron expression
  scheduleLabel: string;     // human-readable
  lastRun: Date | null;
  nextRun: Date | null;
  status: JobStatus;
  lastMessage: string;
  runCount: number;
}

const now = Date.now();

const JOBS = new Map<string, CronJob>([
  ["sms-cadence", {
    id: "sms-cadence",
    name: "SMS Cadence",
    schedule: "0 8,18 * * *",
    scheduleLabel: "Daily 8 AM & 6 PM",
    lastRun: new Date(now - 2 * 60 * 60 * 1000),
    nextRun: new Date(now + 4 * 60 * 60 * 1000),
    status: "success",
    lastMessage: "8 SMS sent to overdue tenants",
    runCount: 94,
  }],
  ["late-fees", {
    id: "late-fees",
    name: "Late Fee Accrual",
    schedule: "0 8 * * *",
    scheduleLabel: "Daily 8 AM",
    lastRun: new Date(now - 18 * 60 * 60 * 1000),
    nextRun: new Date(now + 6 * 60 * 60 * 1000),
    status: "success",
    lastMessage: "3 penalties posted · KES 4,500",
    runCount: 47,
  }],
  ["deposit-depletion", {
    id: "deposit-depletion",
    name: "Deposit Depletion",
    schedule: "1 0 16 * *",
    scheduleLabel: "16th of month",
    lastRun: new Date(now - 13 * 24 * 60 * 60 * 1000),
    nextRun: new Date(now + 3 * 24 * 60 * 60 * 1000),
    status: "success",
    lastMessage: "2 deposits depleted · KES 60,000 recovered",
    runCount: 5,
  }],
  ["generate-invoices", {
    id: "generate-invoices",
    name: "Invoice Generation",
    schedule: "0 1 1 * *",
    scheduleLabel: "1st of month",
    lastRun: new Date(now - 29 * 24 * 60 * 60 * 1000),
    nextRun: new Date(now + 1 * 24 * 60 * 60 * 1000),
    status: "success",
    lastMessage: "131 invoices generated",
    runCount: 4,
  }],
]);

export function getJobs(): CronJob[] {
  return Array.from(JOBS.values());
}

export function getJob(id: string): CronJob | undefined {
  return JOBS.get(id);
}

export function startJob(id: string) {
  const job = JOBS.get(id);
  if (job) {
    JOBS.set(id, { ...job, status: "running", lastRun: new Date() });
  }
}

export function finishJob(id: string, message: string, success = true) {
  const job = JOBS.get(id);
  if (job) {
    JOBS.set(id, {
      ...job,
      status: success ? "success" : "error",
      lastMessage: message,
      runCount: job.runCount + 1,
      lastRun: new Date(),
    });
  }
}
