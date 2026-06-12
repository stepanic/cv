import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "2rem",
        lg: "3rem",
      },
      // Let desktop breathe: fluid until xl, then a wide cap instead of the
      // old 1120px column.
      screens: {
        xl: "1280px",
        "2xl": "1480px",
      },
    },
    extend: {
      colors: {
        // Semantic tokens resolved from CSS variables in globals.css, so the
        // whole palette swaps at runtime: default dark "developer" theme vs.
        // light DOMOVINA branding under html[data-theme="domovina"].
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        surfaceHover: "rgb(var(--c-surface-hover) / <alpha-value>)",
        line: "var(--c-line)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        inkSoft: "rgb(var(--c-ink-soft) / <alpha-value>)",
        inkMuted: "rgb(var(--c-ink-muted) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          soft: "var(--c-accent-soft)",
          border: "var(--c-accent-border)",
          bright: "rgb(var(--c-accent-bright) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "display-xl": [
          "clamp(2.5rem, 5vw + 1rem, 4.25rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "clamp(1.5rem, 2vw + 0.75rem, 2.125rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
      },
      maxWidth: {
        content: "1480px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
