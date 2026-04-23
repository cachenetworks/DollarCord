import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dc: {
          // Backgrounds
          rail: "#1a1b1e",
          sidebar: "#232427",
          chat: "#2b2c30",
          overlay: "#111214",
          // Interactive
          input: "#1e1f22",
          hover: "#35373c",
          active: "#404249",
          selected: "#3d3f45",
          // Text
          text: "#e3e5e8",
          muted: "#8d9099",
          faint: "#5c5f66",
          // Brand
          accent: "#7c6af7",
          "accent-hover": "#6a58e5",
          "accent-dim": "rgba(124, 106, 247, 0.15)",
          // States
          success: "#3ba55d",
          danger: "#ed4245",
          "danger-hover": "#c03537",
          warning: "#faa61a",
          // Borders
          divider: "#3f4147",
          border: "#2e3035",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      scrollbarWidth: { thin: "thin" },
    },
  },
  plugins: [],
};

export default config;
