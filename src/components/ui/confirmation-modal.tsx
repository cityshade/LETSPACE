"use client";

import * as React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChangeItem {
  field: string;
  from: string;
  to: string;
}

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  changes?: ChangeItem[];
  warning?: string;
  variant?: "default" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  /** Whether the confirmation is in a loading state */
  loading?: boolean;
  /** Optional scope selector — "property" | "all" */
  scope?: "property" | "all";
  onScopeChange?: (scope: "property" | "all") => void;
}

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  changes = [],
  warning,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  scope,
  onScopeChange,
}: ConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const isDanger = variant === "danger";

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10",
          "animate-zoom-in"
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-brown-400 hover:text-brown-700 hover:bg-brown-100 transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isDanger ? "bg-brick-100 text-brick-600" : "bg-soil-100 text-soil-600"
            )}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2
              id="confirm-title"
              className="font-serif text-lg font-semibold text-brown-800"
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-brown-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Changes list */}
        {changes.length > 0 && (
          <div className="mb-4 rounded-xl border border-brown-100 overflow-hidden">
            <div className="bg-brown-50 px-4 py-2 text-xs font-medium text-label text-brown-500">
              What&apos;s changing
            </div>
            <div className="divide-y divide-brown-100">
              {changes.map((change, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-brown-600 font-medium">{change.field}</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-brown-400 line-through">{change.from}</span>
                    <span className="text-[10px] text-brown-300">→</span>
                    <span className="text-brown-800 font-semibold">{change.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scope selector */}
        {scope && onScopeChange && (
          <div className="mb-4">
            <p className="text-xs font-medium text-label text-brown-500 mb-2">Apply to</p>
            <div className="flex gap-2">
              {(["property", "all"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onScopeChange(s)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150",
                    scope === s
                      ? "bg-soil-600 text-white"
                      : "bg-brown-100 text-brown-600 hover:bg-brown-200"
                  )}
                >
                  {s === "property" ? "This property" : "All properties"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warning box */}
        {warning && (
          <div className="mb-5 flex gap-2 p-3 rounded-xl bg-brick-50 border border-brick-200">
            <AlertTriangle className="w-4 h-4 text-brick-500 shrink-0 mt-0.5" />
            <p className="text-xs text-brick-700 leading-relaxed">{warning}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming || loading}
            className="flex-1 min-h-12 bg-brown-100 text-brown-700 hover:bg-brown-200 rounded-xl px-4 py-3 font-sans font-medium text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400"
          >
            {cancelLabel}
          </button>
          <Button
            variant={isDanger ? "danger" : "default"}
            onClick={handleConfirm}
            loading={isConfirming || loading}
            className="flex-1 min-h-12"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
