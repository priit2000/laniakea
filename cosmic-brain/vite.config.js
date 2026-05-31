import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Cloudflare Pages serves from the build output directory.
  build: {
    outDir: "dist",
  },
});
