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
        ink: "#0B0B0C",
        paper: "#FFFFFF",
        canvas: "#F6F6F7",
        rule: "#E4E4E7",
        muted: "#71717A",
        credit: "#0E7C5A",
        debit: "#B4342A",
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
