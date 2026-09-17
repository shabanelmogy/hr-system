import type { NextConfig } from "next";

function validateBufferedBodyLimit() {
  const raw = process.env.BFF_MAX_BUFFERED_BODY_BYTES;
  if (raw === undefined) return;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    throw new Error("[next.config.ts] BFF_MAX_BUFFERED_BODY_BYTES must be a positive integer");
  }
}

validateBufferedBodyLimit();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      throw new Error(
        "[next.config.ts] BACKEND_URL is required. Set BACKEND_URL, NEXT_PUBLIC_BACKEND_URL, or NEXT_PUBLIC_API_URL."
      );
    }
    let backend;
    try {
      const parsed = new URL(backendUrl);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
        throw new Error("BACKEND_URL must be an absolute HTTP(S) origin without a path");
      }
      backend = parsed.origin;
    } catch (error) {
      throw new Error(`[next.config.ts] Invalid BACKEND_URL: ${String(error)}`);
    }

    return [
      {
        source: "/hubs/:path*",
        destination: `${backend}/hubs/:path*`
      }
    ];
  }
};

export default nextConfig;
