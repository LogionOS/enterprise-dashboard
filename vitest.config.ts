import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws at import time when loaded from a "client"
      // context. Vitest has no Next.js runtime, so we stub it out with an
      // empty module. Feature code still imports it; the stub just makes
      // the import a no-op in tests.
      "server-only": path.resolve(__dirname, "./src/lib/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
