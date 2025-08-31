import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true,
    target: "es2022", // ⬅ allow top-level await
    modulePreload: true,
  },
  esbuild: {
    target: "es2022", // ⬅ transform TS/JS to ES2022
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022", // ⬅ pre-bundling deps supports TLA
    },
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://api.realo-realestate.com",
        changeOrigin: true,
        secure: true,
      },
      "/health": {
        target: "https://api.realo-realestate.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  base: "/",
}));
