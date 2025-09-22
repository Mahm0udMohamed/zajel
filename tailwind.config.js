// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Pure Sky Blue (نقاء صافي)
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Pure Sky Blue - نقاء صافي
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
          dark: "#0284c7",
        },

        // Secondary Colors - Pure Lavender (بنفسجي نقي)
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Pure Lavender - بنفسجي نقي
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          DEFAULT: "#a855f7",
          light: "#c084fc",
          dark: "#9333ea",
        },

        // Accent Colors - Pure Mint (نعناع نقي)
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Pure Mint - نعناع نقي
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#22c55e",
          light: "#4ade80",
          dark: "#16a34a",
        },

        // Status Colors - ألوان نقية وصافية
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Pure Green - أخضر نقي
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#22c55e",
        },

        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Pure Amber - كهرماني نقي
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          DEFAULT: "#f59e0b",
        },

        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Pure Red - أحمر نقي
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          DEFAULT: "#ef4444",
        },

        info: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Pure Blue - أزرق نقي
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#3b82f6",
        },

        // Neutral Colors - رمادي نقي وصافي
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        // Background Colors - بياض جميل ونقاء صافي
        background: {
          primary: "#ffffff", // أبيض نقي
          secondary: "#fefefe", // أبيض ناعم جداً
          tertiary: "#fdfdfd", // أبيض دافئ
          dark: "#0f172a",
        },

        // Text Colors - نصوص نقية وواضحة
        text: {
          primary: "#1e293b", // رمادي داكن نقي
          secondary: "#64748b", // رمادي متوسط نقي
          tertiary: "#94a3b8", // رمادي فاتح نقي
          inverse: "#ffffff", // أبيض نقي
        },

        // Border Colors - حدود نقية وخفيفة
        border: {
          primary: "#f1f5f9", // حدود بيضاء ناعمة
          secondary: "#e2e8f0", // حدود رمادية فاتحة
          focus: "#0ea5e9", // حدود تركيز زرقاء نقية
        },

        // Legacy colors for backward compatibility
        emeraldTeal: "#c061d5",
        brown: {
          50: "#fdf7f2",
          100: "#f5e7e3",
          200: "#e8c1b5",
          500: "#8b4513",
          900: "#3f1f09",
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
