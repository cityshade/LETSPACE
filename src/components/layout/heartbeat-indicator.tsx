"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "success" | "error" | "running" | "never";
  lastRun: string | null;
  lastMessage: string;
  runCount: number;
}

interface HeartbeatData {
  status: "healthy" | "degraded" | "running";
  timestamp: string;
  jobs: CronJob[];
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

const statusDot: Record<string, string> = {
  success: "bg-emerald-500",
  running: "bg-yellow-400",
  error:   "bg-brick-500",
  never:   "bg-gray-300",
};

export function HeartbeatIndicator() {
  const [data, setData] = useState<HeartbeatData | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const poll = async () => {
    try {
      const res = await fetch("/api/heartbeat");
      if (res.ok) setData(await res.json());
    } catch {}
  };

  useEffect(() => {
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const systemOk = !data || data.status !== "degraded";
  const anyRunning = data?.status === "running";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
        title="System status"
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          {(systemOk || anyRunning) && (
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
              anyRunning ? "bg-yellow-400" : "bg-emerald-500"
            )} />
          )}
          <span className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            anyRunning ? "bg-yellow-400" : systemOk ? "bg-emerald-500" : "bg-brick-500"
          )} />
        </span>
        <span className="hidden sm:inline font-medium">
          {anyRunning ? "Running" : systemOk ? "Systems OK" : "Degraded"}
        </span>
      </button>

      {open && data && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-white shadow-lg z-50">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Automation Status</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.jobs.length} jobs · Last checked {timeAgo(data.timestamp)}
            </p>
          </div>
          <div className="p-2 space-y-1">
            {data.jobs.map((job) => (
              <div key={job.id} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", statusDot[job.status])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900">{job.name}</p>
                    <p className="text-[10px] text-gray-400 shrink-0">{timeAgo(job.lastRun)}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{job.lastMessage || job.schedule}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-2">
            <p className="text-[10px] text-gray-400">Auto-refreshes every 30s</p>
          </div>
        </div>
      )}
    </div>
  );
}
