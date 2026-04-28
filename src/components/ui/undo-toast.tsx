"use client";

import * as React from "react";
import { CheckCircle, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRoot } from "react-dom/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UndoToastOptions {
  message: string;
  description?: string;
  onUndo?: () => void;
  duration?: number; // ms, default 10000
}

// ─── Single Toast component ───────────────────────────────────────────────────

interface ToastItemProps extends UndoToastOptions {
  onDismiss: () => void;
}

function ToastItem({
  message,
  description,
  onUndo,
  duration = 10000,
  onDismiss,
}: ToastItemProps) {
  const [progress, setProgress] = React.useState(100);
  const [exiting, setExiting] = React.useState(false);
  const rafRef = React.useRef<number>(0);
  const startRef = React.useRef<number>(0);

  React.useEffect(() => {
    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        dismiss();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    cancelAnimationFrame(rafRef.current);
    setExiting(true);
    setTimeout(onDismiss, 200);
  };

  const handleUndo = () => {
    cancelAnimationFrame(rafRef.current);
    onUndo?.();
    dismiss();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "bg-brown-800 text-white rounded-2xl shadow-2xl p-4 max-w-sm w-full",
        exiting ? "animate-slide-to-bottom" : "animate-slide-from-bottom"
      )}
    >
      {/* Content row */}
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-soil-400 shrink-0 mt-0.5" aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{message}</p>
          {description && (
            <p className="text-xs text-brown-300 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-soil-300 font-semibold text-sm hover:text-soil-200 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-soil-400 rounded px-1"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                Undo
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-brown-400 hover:text-white transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-soil-400 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-brown-600 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-soil-400 rounded-full"
          style={{ width: `${progress}%`, transition: "width 16ms linear" }}
        />
      </div>
    </div>
  );
}

// ─── Toast container (portal-managed) ────────────────────────────────────────

interface ToastEntry extends UndoToastOptions {
  id: string;
}

const MAX_TOASTS = 3;
let containerId = "cornerstone-toast-container";
let toasts: ToastEntry[] = [];
let setToastsRef: React.Dispatch<React.SetStateAction<ToastEntry[]>> | null = null;

function ToastContainer() {
  const [items, setItems] = React.useState<ToastEntry[]>([]);
  setToastsRef = setItems;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end"
    >
      {items.map((t) => (
        <ToastItem
          key={t.id}
          {...t}
          onDismiss={() => {
            toasts = toasts.filter((x) => x.id !== t.id);
            setItems((prev) => prev.filter((x) => x.id !== t.id));
          }}
        />
      ))}
    </div>
  );
}

function ensureContainer() {
  if (typeof window === "undefined") return;
  if (document.getElementById(containerId)) return;
  const el = document.createElement("div");
  el.id = containerId;
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(<ToastContainer />);
}

/** Show an undo toast. Call from anywhere — no provider required. */
export function showUndoToast(options: UndoToastOptions) {
  if (typeof window === "undefined") return;
  ensureContainer();

  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const entry: ToastEntry = { ...options, id };

  toasts = [...toasts.slice(-(MAX_TOASTS - 1)), entry];

  if (setToastsRef) {
    setToastsRef((prev) => [...prev.slice(-(MAX_TOASTS - 1)), entry]);
  }
}

// ─── Named component export (optional declarative use) ────────────────────────

export { ToastContainer as UndoToastProvider };
export default { showUndoToast };
