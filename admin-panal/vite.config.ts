import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: true, // يعمل على جميع واجهات الشبكة
      port: 5174, // منفذ مختلف عن الفرونت إند
      https: {
        key: fs.readFileSync("./ssl/localhost-key.pem"),
        cert: fs.readFileSync("./ssl/localhost-cert.pem"),
      },
    },
    envPrefix: "VITE_",
    define: {
      // استخدام متغيرات البيئة
      __API_URL__: JSON.stringify(
        env.VITE_API_URL || "https://localhost:3002/api"
      ),
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
  };
});
