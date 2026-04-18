import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

process.env.NEXT_PUBLIC_LOGIONOS_API_BASE =
  process.env.NEXT_PUBLIC_LOGIONOS_API_BASE || "http://api.test";
process.env.NEXT_PUBLIC_DASHBOARD_BASE =
  process.env.NEXT_PUBLIC_DASHBOARD_BASE || "http://dashboard.test";

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserver;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
