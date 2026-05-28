import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "hsl(var(--color-ink) / <alpha-value>)",
        canvas: "hsl(var(--color-canvas) / <alpha-value>)",
        panel: "hsl(var(--color-panel) / <alpha-value>)",
        elevated: "hsl(var(--color-elevated) / <alpha-value>)",
        overlay: "hsl(var(--color-overlay) / <alpha-value>)",
        muted: "#9aa3b2",
        line: "rgb(var(--color-line) / 0.10)",
        "line-strong": "rgb(var(--color-line) / 0.16)",
        brand: {
          50: "#fdf2ff",
          100: "#fae8ff",
          200: "#f5c8ff",
          300: "#f08afd",
          400: "#ea59dc",
          500: "#ea59dc",
          600: "#6a0dad",
          700: "#4b087b",
          800: "#310651",
          900: "#1f0434"
        },
        theme: {
          primary: "hsl(var(--color-primary) / <alpha-value>)",
          secondary: "hsl(var(--color-secondary) / <alpha-value>)",
          foreground: "hsl(var(--color-foreground) / <alpha-value>)",
          subdued: "hsl(var(--color-subdued) / <alpha-value>)",
          success: "hsl(var(--color-success) / <alpha-value>)",
          warning: "hsl(var(--color-warning) / <alpha-value>)",
          danger: "hsl(var(--color-danger) / <alpha-value>)"
        },
        accent: {
          emerald: "#34d399",
          cyan: "#22d3ee",
          amber: "#fbbf24",
          rose: "#fb7185"
        }
      },
      borderRadius: {
        crm: "var(--radius-crm)",
        "crm-lg": "var(--radius-crm-lg)",
        "crm-xl": "var(--radius-crm-xl)"
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        glow: "var(--shadow-glow)",
        popover: "var(--shadow-popover)",
        focus: "var(--shadow-focus)"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.16,1,.3,1)"
      },
      transitionDuration: {
        premium: "220ms"
      },
      keyframes: {
        "crm-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        },
        "crm-enter": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "crm-shimmer": "crm-shimmer 1.35s ease-in-out infinite",
        "crm-enter": "crm-enter 180ms cubic-bezier(.16,1,.3,1) both"
      }
    }
  },
  plugins: []
};

export default config;
