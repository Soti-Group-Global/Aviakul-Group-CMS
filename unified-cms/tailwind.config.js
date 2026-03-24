// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      colors: {
        // Light theme colors
        light: {
          bg: "#FFFFFF",
          sidebar: "#F9FAFB",
          surface: "#F3F4F6",
          border: "rgba(0,0,0,0.05)",
          "border-strong": "rgba(0,0,0,0.1)",
          text: "#111827",
          "text-muted": "#6B7280",
          "text-dim": "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};
