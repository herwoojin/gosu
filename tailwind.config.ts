import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", soft: "#EAF1FF" },
        ink: "#0F172A",
        muted: "#64748B",
        surface: "#FFFFFF",
        bg: "#F5F8FF",
        success: "#16A34A",
        warn: "#F59E0B",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Paperlogy", "Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(15, 23, 42, 0.06)",
      },
      keyframes: {
        "battery-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "battery-breathe": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "battery-critical": "battery-pulse 0.6s ease-in-out infinite",
        "battery-danger": "battery-pulse 1.2s ease-in-out infinite",
        "battery-warn": "battery-breathe 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
