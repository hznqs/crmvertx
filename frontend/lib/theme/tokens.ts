export const crmTheme = {
  name: "Vertxmidia Enterprise Dark",
  colors: {
    primary: "#6a0dad",
    secondary: "#ea59dc",
    black: "#090909",
    panel: "#111014",
    elevated: "#17101b",
    foreground: "#f8fafc",
    muted: "#9aa3b2",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#fb7185"
  },
  radius: {
    control: "0.75rem",
    surface: "1rem",
    overlay: "1.25rem"
  },
  motion: {
    duration: 220,
    easing: "cubic-bezier(.16,1,.3,1)"
  },
  shadows: {
    panel: "var(--shadow-panel)",
    glow: "var(--shadow-glow)",
    popover: "var(--shadow-popover)",
    focus: "var(--shadow-focus)"
  },
  charts: {
    brand: "#ea59dc",
    primary: "#6a0dad",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#fb7185"
  }
} as const;

export type CrmTheme = typeof crmTheme;
