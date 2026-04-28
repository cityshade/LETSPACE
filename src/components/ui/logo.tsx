"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "horizontal" | "mark" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  /** On dark backgrounds — reverses to warm soil-100 */
  inverted?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 24, text: "text-lg",   tagline: "text-[10px]" },
  md: { mark: 32, text: "text-xl",   tagline: "text-xs"     },
  lg: { mark: 40, text: "text-2xl",  tagline: "text-xs"     },
  xl: { mark: 56, text: "text-3xl",  tagline: "text-sm"     },
};

/** The brick mark — a stylised cornerstone with "CS" inset */
function BrickMark({
  size,
  inverted,
}: {
  size: number;
  inverted?: boolean;
}) {
  const base   = inverted ? "#FBE8DD" : "#B81D13"; // brick-600 / soil-100
  const accent = inverted ? "#EDA883" : "#BC4F1A"; // soil-300 / soil-600
  const shadow = inverted ? "#FAF7F5" : "#3A2515"; // brown-50  / brown-800
  const text   = inverted ? "#3A2515" : "#FFFFFF"; // brown-800 / white

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Drop shadow layer */}
      <rect x="3" y="5" width="34" height="34" rx="6" fill={shadow} opacity="0.18" />

      {/* Main brick body */}
      <rect x="1" y="1" width="34" height="34" rx="6" fill={base} />

      {/* Highlight edge (top-left bevel) */}
      <rect x="1" y="1" width="34" height="5" rx="5" fill={accent} opacity="0.45" />
      <rect x="1" y="1" width="5" height="34" rx="5" fill={accent} opacity="0.25" />

      {/* "CS" lettermark — clean, bold, centered */}
      <text
        x="18"
        y="24"
        textAnchor="middle"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontWeight="700"
        fontSize="16"
        fill={text}
        letterSpacing="-0.5"
      >
        CS
      </text>

      {/* Mortar line — horizontal groove across middle */}
      <rect x="5" y="19" width="26" height="1.5" rx="1" fill={shadow} opacity="0.12" />
    </svg>
  );
}

/** Full Cornerstone logo — horizontal, mark-only, or stacked */
export function Logo({
  variant = "horizontal",
  size = "md",
  inverted = false,
  className,
}: LogoProps) {
  const s = sizes[size];

  const wordmarkColor  = inverted ? "#FBE8DD" : "#3A2515"; // soil-100 / brown-800
  const taglineColor   = inverted ? "#EDA883" : "#D4692E"; // soil-300 / soil-500

  if (variant === "mark") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <BrickMark size={s.mark} inverted={inverted} />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-flex flex-col items-center gap-1", className)}>
        <BrickMark size={s.mark} inverted={inverted} />
        <span
          className={cn("font-serif font-bold tracking-tight leading-none", s.text)}
          style={{ color: wordmarkColor }}
        >
          CORNERSTONE
        </span>
        <span
          className={cn("font-sans font-medium tracking-wide leading-none", s.tagline)}
          style={{ color: taglineColor }}
        >
          The Foundation of Modern Property Management
        </span>
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <BrickMark size={s.mark} inverted={inverted} />
      <div className="flex flex-col justify-center">
        <span
          className={cn("font-serif font-bold tracking-tight leading-none", s.text)}
          style={{ color: wordmarkColor }}
        >
          CORNERSTONE
        </span>
        {size !== "sm" && (
          <span
            className={cn("font-sans font-medium tracking-wide leading-none mt-0.5", s.tagline)}
            style={{ color: taglineColor }}
          >
            The Foundation of Modern Property Management
          </span>
        )}
      </div>
    </div>
  );
}

export default Logo;
