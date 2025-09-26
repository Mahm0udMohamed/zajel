import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // يعمل على جميع واجهات الشبكة
    port: 5174, // منفذ مختلف عن الفرونت إند
    https: {
      key: fs.readFileSync("./ssl/localhost-key.pem"),
      cert: fs.readFileSync("./ssl/localhost-cert.pem"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
