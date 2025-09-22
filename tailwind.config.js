// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8b4589",
          light: "#a55ba4",
          dark: "#6e3470",
        },
        secondary: {
          DEFAULT: "#e7a2c4",
          light: "#f5d1e3",
          dark: "#cc7da7",
        },
        accent: {
          DEFAULT: "#f8b400",
          light: "#ffd54f",
          dark: "#c78a00",
        },
        success: "#4caf50",
        warning: "#ff9800",
        error: "#f44336",
        emeraldTeal: "#c061d5",
        brown: {
          50: "#fdf7f2",
          100: "#f5e7e3",
          200: "#e8c1b5",
          500: "#8b4513",
          900: "#3f1f09",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          800: "#9f1239",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          800: "#3730a3",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          800: "#065f46",
        },
        cyan: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          800: "#0e7490",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          800: "#115e59",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        "sans-en": [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        "sans-ar": ["Cairo", "Segoe UI Arabic", "Tahoma", "sans-serif"],
        serif: ["Amiri", "Times New Roman", "serif"],
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
