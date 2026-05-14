import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // SEC-12 FIX: Enable TypeScript checking in builds
  // Previously ignoreBuildErrors: true was hiding real type errors
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true, // SEC-12 FIX: Enable React strict mode
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
