"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  formatValue?: (v: number) => string;
}

export function Slider({
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
}: SliderProps) {
  const [dragging, setDragging] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const pct = ((value - min) / (max - min)) * 100;
  const displayed = formatValue ? formatValue(value) : `${value}${unit ? " " + unit : ""}`;

  const valueFromPct = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
    const stepped = Math.round(raw / step) * step;
    return Math.min(max, Math.max(min, stepped));
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onChange(valueFromPct(e.clientX));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    }
    if (e.key === "Home") { e.preventDefault(); onChange(min); }
    if (e.key === "End")  { e.preventDefault(); onChange(max); }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || disabled) return;
    onChange(valueFromPct(e.clientX));
  };

  const handlePointerUp = () => setDragging(false);

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor={id} className="font-sans text-sm font-medium text-brown-800">
            {label}
          </label>
          {description && (
            <p className="text-xs text-brown-400 mt-0.5">{description}</p>
          )}
        </div>
        <span className="font-mono text-sm font-bold text-brown-800 tabular-nums">
          {displayed}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Track background */}
        <div className="absolute left-0 right-0 h-1.5 bg-brown-200 rounded-full overflow-hidden">
          {/* Filled portion */}
          <div
            className="h-full bg-soil-600 rounded-full transition-all duration-75"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          id={id}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ left: `calc(${pct}% - 12px)` }}
          className={cn(
            "absolute w-6 h-6 rounded-full bg-white border-2 border-soil-600 shadow-md",
            "transition-transform duration-75",
            "hover:scale-110 hover:shadow-lg",
            dragging && "scale-110 shadow-xl",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50 border-brown-300"
          )}
        >
          {/* Tooltip on drag */}
          {dragging && (
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brown-800 text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
              aria-hidden="true"
            >
              {displayed}
            </div>
          )}
        </div>
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] text-brown-400 font-mono">
        <span>{formatValue ? formatValue(min) : `${min}${unit ? " " + unit : ""}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit ? " " + unit : ""}`}</span>
      </div>
    </div>
  );
}

export default Slider;
