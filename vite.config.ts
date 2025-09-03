// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";

// Allow CJS-style require inside an ESM/TS file (no top-level await needed)
const require = createRequire(import.meta.url);

function optionalReplitRuntimeErrorModal() {
  try {
    // If the plugin is installed, use it; if not, ignore quietly.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const plugin = require("@replit/vite-plugin-runtime-error-modal").default;
    return plugin();
  } catch {
    return undefined;
  }
}

export default defineConfig({
  plugins: [react(), optionalReplitRuntimeErrorModal()].filter(Boolean),
  // If your React app lives in /client, keep root as "client".
  // If it’s at project root, remove this "root" line.
  root: "client",
  resolve: {
    alias: {
      "@": "/client/src",
      "@shared": "/shared",
      "@assets": "/attached_assets",
    },
  },
  build: {
    // This matches your scripts; Replit’s build will write here.
    outDir: "client-dist",
    emptyOutDir: true,
  },
});
