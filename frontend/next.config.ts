import type { NextConfig } from "next";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,

  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: [
    "192.168.0.101",
    "192.168.0.101:3000",
    "192.168.0.101:3001",
    "localhost:3000",
    "localhost:3001",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${DJANGO_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
