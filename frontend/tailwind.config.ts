import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f5fa",
          100: "#e6e8f2",
          200: "#c9cee2",
          300: "#a3abc8",
          400: "#7a84a8",
          500: "#5b647d",
          600: "#434b63",
          700: "#2e364d",
          800: "#1c2236",
          900: "#111627",
          950: "#0a0e1b",
        },
        cobalt: {
          50: "#eef1ff",
          100: "#dfe4ff",
          200: "#c3ccff",
          300: "#9aa9ff",
          400: "#6d7dfa",
          500: "#4a5cf0",
          600: "#2f45e6",
          700: "#2535c4",
          800: "#232f9c",
          900: "#222d7b",
        },
        amber: {
          400: "#ffc233",
          500: "#f5a400",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
