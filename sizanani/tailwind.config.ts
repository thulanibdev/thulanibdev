import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sizanani brand — premium, African, hopeful.
        ink: {
          DEFAULT: "#12130f",
          soft: "#22241d",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e3c976",
          dark: "#a4842f",
        },
        veld: {
          // deep green — growth, hope
          DEFAULT: "#1f6f54",
          light: "#2e9a76",
        },
        clay: "#c86b3c", // warm African terracotta accent
        paper: "#faf8f2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
