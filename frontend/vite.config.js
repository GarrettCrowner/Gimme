import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      // Dev only — proxies to local backend
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
  },
}));
