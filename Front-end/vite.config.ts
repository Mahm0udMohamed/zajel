import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // يعمل على جميع واجهات الشبكة
    port: 5173, // المنفذ الافتراضي
    https: {
      key: fs.readFileSync("./ssl/localhost-key.pem"),
      cert: fs.readFileSync("./ssl/localhost-cert.pem"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  assetsInclude: ["**/*.ttf"],
});
