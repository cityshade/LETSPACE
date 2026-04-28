"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Format the displayed value (e.g. add commas for large numbers) */
  formatValue?: (v: number) => string;
}

export function Stepper({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled = false,
  formatValue,
}: StepperProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  const decrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const increment = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleValueClick = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitDraft = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitDraft();
    if (e.key === "Escape") setEditing(false);
  };

  const displayed = formatValue ? formatValue(value) : String(value);

  return (
    <div className="flex items-center justify-between gap-4 min-h-12">
      {/* Label + description */}
      <div className="flex flex-col justify-center">
        <span className="font-sans text-sm font-medium text-brown-800">{label}</span>
        {description && (
          <span className="text-xs text-brown-400 mt-0.5 leading-relaxed">{description}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Decrement */}
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={decrement}
          disabled={disabled || value <= min}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-brown-100 border-2 border-brown-200 text-brown-600",
            "hover:bg-brown-200 hover:border-brown-300",
            "active:scale-95 active:bg-brown-300 transition-all duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400",
            (disabled || value <= min) && "opacity-40 cursor-not-allowed"
          )}
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Value display — tap to edit inline */}
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={handleKeyDown}
            className={cn(
              "font-mono text-2xl font-bold text-brown-800 tabular-nums text-center",
              "bg-soil-50 rounded-lg py-2 px-3 min-w-[72px]",
              "border-2 border-soil-400 outline-none",
              "transition-all duration-100"
            )}
            style={{ width: `${Math.max(72, displayed.length * 16 + 32)}px` }}
          />
        ) : (
          <button
            type="button"
            onClick={handleValueClick}
            disabled={disabled}
            aria-label={`Edit ${label} value`}
            className={cn(
              "font-mono text-2xl font-bold text-brown-800 tabular-nums text-center",
              "bg-soil-50 rounded-lg py-2 px-3 min-w-[72px]",
              "hover:bg-soil-100 cursor-pointer transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {displayed}
            {unit && (
              <span className="font-sans text-sm font-normal text-brown-400 ml-1">
                {unit}
              </span>
            )}
          </button>
        )}

        {/* Increment */}
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={increment}
          disabled={disabled || value >= max}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-brown-100 border-2 border-brown-200 text-brown-600",
            "hover:bg-brown-200 hover:border-brown-300",
            "active:scale-95 active:bg-brown-300 transition-all duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400",
            (disabled || value >= max) && "opacity-40 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Stepper;
