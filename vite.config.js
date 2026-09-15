import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/free-browser-ai/",
  plugins: [react()],
  root: "free-browser-ai",
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
