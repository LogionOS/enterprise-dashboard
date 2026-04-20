import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is for self-hosted Docker/Node deploys only.
  // Vercel uses its own serverless build — do NOT set output here.
  ...(process.env.STANDALONE === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
