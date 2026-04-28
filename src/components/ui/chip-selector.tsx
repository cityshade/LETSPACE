"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipOption {
  id: string;
  label: string;
  disabled?: boolean;
}

interface ChipSelectorProps {
  label: string;
  description?: string;
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  /** Maximum number of selectable chips (unlimited if omitted) */
  max?: number;
}

export function ChipSelector({
  label,
  description,
  options,
  selected,
  onChange,
  disabled = false,
  max,
}: ChipSelectorProps) {
  const toggle = (id: string) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (max !== undefined && selected.length >= max) return;
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <span className="font-sans text-sm font-medium text-brown-800">{label}</span>
        {description && (
          <p className="text-xs text-brown-400 mt-0.5">{description}</p>
        )}
      </div>

      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = disabled || opt.disabled;
          const atMax = max !== undefined && selected.length >= max && !isSelected;

          return (
            <button
              key={opt.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={opt.label}
              disabled={isDisabled || atMax}
              onClick={() => toggle(opt.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full",
                "font-sans text-sm transition-all duration-100 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-offset-1",
                "min-h-[40px]",
                isSelected
                  ? "bg-soil-600 text-white font-medium"
                  : isDisabled
                  ? "bg-brown-100 text-brown-300 border border-dashed border-brown-200 cursor-not-allowed"
                  : atMax
                  ? "bg-white text-brown-300 border border-brown-200 cursor-not-allowed opacity-60"
                  : "bg-white text-brown-600 border border-brown-200 hover:bg-brown-50 hover:border-brown-300 cursor-pointer"
              )}
            >
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChipSelector;
