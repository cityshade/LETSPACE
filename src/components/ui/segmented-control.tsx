"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  label: string;
  description?: string;
  options: SegmentOption[];
  selected: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export function SegmentedControl({
  label,
  description,
  options,
  selected,
  onChange,
  disabled = false,
}: SegmentedControlProps) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <div>
        <span className="font-sans text-sm font-medium text-brown-800">{label}</span>
        {description && (
          <p className="text-xs text-brown-400 mt-0.5">{description}</p>
        )}
      </div>

      {/* Pill container */}
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-xl bg-brown-100 p-1 gap-0 flex-wrap"
      >
        {options.map((opt) => {
          const isSelected = opt.id === selected;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={opt.label}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(opt.id)}
              className={cn(
                "flex-1 text-center px-4 py-2.5 rounded-lg min-w-[80px]",
                "font-sans text-sm transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-inset",
                isSelected
                  ? "bg-soil-600 text-white font-semibold shadow-sm"
                  : isDisabled
                  ? "text-brown-300 cursor-not-allowed border border-dashed border-brown-200 bg-brown-100"
                  : "text-brown-600 hover:bg-brown-200 cursor-pointer"
              )}
            >
              <span className="block leading-tight">{opt.label}</span>
              {opt.description && !isDisabled && (
                <span
                  className={cn(
                    "block text-[10px] leading-tight mt-0.5",
                    isSelected ? "text-soil-200" : "text-brown-400"
                  )}
                >
                  {opt.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SegmentedControl;
