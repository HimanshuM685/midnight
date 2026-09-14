import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [react(), wasm()],
  define: {
    "process.env": {},
    global: "globalThis",
  },
  server: {
    port: 3001,
  },
  build: {
    target: "esnext",
    outDir: "dist",
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: { "top-level-await": true },
    },
    exclude: ["@midnight-ntwrk/onchain-runtime-v3"],
  },
});
