import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // يعمل على جميع واجهات الشبكة
    port: 5173, // المنفذ الافتراضي
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  assetsInclude: ["**/*.ttf"],
});
