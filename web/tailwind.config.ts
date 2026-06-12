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
      screens: {
        "2xl": "1120px",
      },
    },
    extend: {
      colors: {
        // Dark theme palette with a single Croatian-red accent.
        bg: "#0B0E13",
        surface: "#11151C",
        surfaceHover: "#161B24",
        line: "rgba(255, 255, 255, 0.08)",
        ink: "#E8EAED",
        inkSoft: "#B8BDC6",
        inkMuted: "#7E8590",
        accent: {
          DEFAULT: "#E63946",
          soft: "rgba(230, 57, 70, 0.12)",
          border: "rgba(230, 57, 70, 0.35)",
          bright: "#F25965",
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
        content: "1120px",
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
