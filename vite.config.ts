// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ["lucide-react"],
//   },
//   assetsInclude: ["**/*.ttf"],
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./sslOptions/127.0.0.1+2-key.pem"),
      cert: fs.readFileSync("./sslOptions/127.0.0.1+2.pem"),
    },
    port: 5173,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
