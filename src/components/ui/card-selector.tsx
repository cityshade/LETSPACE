"use client";

import * as React from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardOption {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface CardSelectorProps {
  label: string;
  description?: string;
  options: CardOption[];
  selected: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  columns?: 1 | 2 | 3;
}

export function CardSelector({
  label,
  description,
  options,
  selected,
  onChange,
  disabled = false,
  columns = 2,
}: CardSelectorProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div className="space-y-3">
      <div>
        <span className="font-sans text-sm font-medium text-brown-800">{label}</span>
        {description && (
          <p className="text-xs text-brown-400 mt-0.5">{description}</p>
        )}
      </div>

      <div role="radiogroup" aria-label={label} className={cn("grid gap-4", gridClass)}>
        {options.map((opt) => {
          const isSelected = opt.id === selected;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={opt.title}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(opt.id)}
              className={cn(
                "relative p-6 rounded-2xl text-left cursor-pointer",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-offset-2",
                isSelected
                  ? "bg-white border-2 border-soil-600 shadow-md ring-4 ring-soil-100"
                  : isDisabled
                  ? "bg-brown-50 border-2 border-brown-200 cursor-not-allowed opacity-60"
                  : "bg-white border-2 border-brown-200 hover:border-brown-300 hover:shadow-md"
              )}
            >
              {/* Selected checkmark badge */}
              {isSelected && (
                <span className="absolute top-3 right-3 bg-soil-600 rounded-full p-0.5">
                  <CheckCheck className="w-4 h-4 text-white" aria-hidden="true" />
                </span>
              )}

              {/* Badge label */}
              {opt.badge && !isSelected && (
                <span className="absolute top-3 right-3 bg-soil-100 text-soil-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {opt.badge}
                </span>
              )}

              {/* Icon */}
              {opt.icon && (
                <div
                  className={cn(
                    "mb-3 text-2xl",
                    isSelected ? "text-soil-600" : "text-brown-400"
                  )}
                >
                  {opt.icon}
                </div>
              )}

              {/* Title */}
              <p
                className={cn(
                  "font-sans font-semibold text-sm",
                  isSelected ? "text-soil-700" : "text-brown-800"
                )}
              >
                {opt.title}
              </p>

              {/* Description */}
              {opt.description && (
                <p
                  className={cn(
                    "font-sans text-xs mt-1 leading-relaxed",
                    isSelected ? "text-soil-500" : "text-brown-400"
                  )}
                >
                  {opt.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CardSelector;
