import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output removed — incompatible with Netlify's @netlify/plugin-nextjs
  // Netlify plugin handles serverless function generation automatically
  // Use webpack instead of Turbopack for production builds (Turbopack has issues with ioredis)
  // Turbopack is still used for dev via `next dev`
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Server-only packages that must not be bundled for the client
  serverExternalPackages: [
    'ioredis',
    'bcryptjs',
    // NOTE: @prisma/client removed from serverExternalPackages
    // Turbopack was loading it as external before process.env.DATABASE_URL
    // was set, causing "URL must start with postgresql://" validation error.
    // By bundling it, Turbopack can properly order env var initialization.
    'canvas',
    'sharp',
  ],
  // Expose DEMO_MODE to client-side code so the UI can detect demo mode
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.DEMO_MODE || '',
  },

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
