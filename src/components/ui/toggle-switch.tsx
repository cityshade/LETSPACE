"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: "default" | "sm";
  id?: string;
}

export function ToggleSwitch({
  label,
  description,
  enabled,
  onChange,
  disabled = false,
  size = "default",
  id,
}: ToggleSwitchProps) {
  const switchId = id ?? React.useId();

  const isDefault = size === "default";

  return (
    <div className="flex items-start justify-between gap-4 min-h-12">
      {/* Label + description */}
      <div className="flex flex-col justify-center">
        <label
          htmlFor={switchId}
          className={cn(
            "font-sans font-medium text-brown-800 cursor-pointer select-none",
            isDefault ? "text-sm" : "text-xs",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-brown-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Switch track + thumb */}
      <button
        id={switchId}
        role="switch"
        type="button"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-offset-2",
          isDefault ? "w-12 h-7" : "w-10 h-6",
          enabled
            ? "bg-soil-600"
            : "bg-brown-200",
          enabled && "ring-2 ring-soil-100",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full bg-white shadow-md",
            // toggle-transition uses the CSS custom property spring easing
            "transition-transform duration-150",
            isDefault
              ? cn("w-6 h-6", enabled ? "translate-x-[22px]" : "translate-x-0.5")
              : cn("w-5 h-5", enabled ? "translate-x-[18px]" : "translate-x-0.5")
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
        />
      </button>
    </div>
  );
}

export default ToggleSwitch;
