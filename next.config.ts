import type { NextConfig } from "next";

const crmAllowedOrigins = (process.env.CRM_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      ...(crmAllowedOrigins.length
        ? { allowedOrigins: crmAllowedOrigins }
        : {}),
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/andrelook-v1/**",
        protocol: "https",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
