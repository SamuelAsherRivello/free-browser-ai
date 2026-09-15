import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/react-trading-simulator-runtime-agent/",
  plugins: [react()],
  root: "react-trading-simulator-runtime-agent",
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
