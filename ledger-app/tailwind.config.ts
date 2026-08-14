import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        paper: "var(--paper)",
        "paper-elevated": "var(--paper-elevated)",
        canvas: "var(--canvas)",
        rule: "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-contrast": "var(--accent-contrast)",
        credit: "var(--credit)",
        debit: "var(--debit)",
        "credit-soft": "var(--credit-soft)",
        "debit-soft": "var(--debit-soft)",
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        panel: "var(--shadow-panel)",
      },
      ringColor: {
        accent: "var(--accent-ring)",
      },
    },
  },
  plugins: [],
};
export default config;
