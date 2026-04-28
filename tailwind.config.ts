import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic tokens (kept for existing components)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ─── CORNERSTONE BRAND COLORS ────────────────────────────────────
        // Shorthand aliases: use soil-600, brown-200, brick-500 directly.

        // RED SOIL — Primary accent, warmth, earth
        soil: {
          50:  "#FDF8F5",
          100: "#FBE8DD",
          200: "#F5C8B0",
          300: "#EDA883",
          400: "#E48856",
          500: "#D4692E",
          600: "#BC4F1A",
          700: "#A03D0E",
          800: "#7A2D08",
          900: "#5A1E04",
        },

        // BROWN — Foundation, stability, trust
        brown: {
          50:  "#FAF7F5",
          100: "#F0E8E0",
          200: "#DBC8B8",
          300: "#C4A590",
          400: "#A8836A",
          500: "#8B6548",
          600: "#6E4C32",
          700: "#523822",
          800: "#3A2515",
          900: "#24140A",
        },

        // RED BRICK — Structure, permanence, solidity
        brick: {
          50:  "#FEF5F4",
          100: "#FDD5D2",
          200: "#FAA8A2",
          300: "#F67A71",
          400: "#E84D41",
          500: "#D42A1E",
          600: "#B81D13",
          700: "#9A140C",
          800: "#7A0E08",
          900: "#5A0804",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        mono:  ["var(--font-jetbrains-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },

      animation: {
        "fade-in":           "fade-in 150ms var(--ease-out)",
        "fade-out":          "fade-out 150ms var(--ease-in)",
        "slide-up":          "slide-up 200ms var(--ease-out)",
        "slide-from-bottom": "slide-from-bottom 250ms var(--ease-out)",
        "slide-to-bottom":   "slide-to-bottom 200ms var(--ease-in)",
        "zoom-in":           "zoom-in 200ms var(--ease-out)",
        "zoom-out":          "zoom-out 150ms var(--ease-in)",
        "shimmer":           "shimmer 1.5s infinite",
        "shake":             "shake 300ms var(--spring)",
        // shadcn/ui compat
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to:   { opacity: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(8px)" },
          to:   { transform: "translateY(0)" },
        },
        "slide-from-bottom": {
          from: { transform: "translateY(16px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-to-bottom": {
          from: { transform: "translateY(0)",    opacity: "1" },
          to:   { transform: "translateY(16px)", opacity: "0" },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to:   { transform: "scale(1)",    opacity: "1" },
        },
        "zoom-out": {
          from: { transform: "scale(1)",    opacity: "1" },
          to:   { transform: "scale(0.95)", opacity: "0" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%":      { transform: "translateX(-4px)" },
          "75%":      { transform: "translateX(4px)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
