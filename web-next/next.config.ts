import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async redirects() {
    return [
      { source: "/resetpassword", destination: "/reset-password", permanent: true },
      { source: "/auth/emailConfirmation", destination: "/email-confirmation", permanent: true },
      { source: "/auth/email-confirmation", destination: "/email-confirmation", permanent: true },
      { source: "/auth/users", destination: "/administration/users", permanent: true },
      { source: "/auth/roles", destination: "/administration/roles", permanent: true },
      {
        source: "/auth/manage-role-permissions/:path*",
        destination: "/administration/manage-role-permissions/:path*",
        permanent: true
      },
      { source: "/profilePage", destination: "/profile", permanent: true },
      { source: "/extras-filesmanager", destination: "/files", permanent: true },
      { source: "/extras-appointments", destination: "/appointments", permanent: true },
      {
        source: "/extras-show-media/:path*",
        destination: "/files/view/:path*",
        permanent: true
      },
      {
        source: "/advancedTools/:path*",
        destination: "/advanced-tools/:path*",
        permanent: true
      }
    ];
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
    const backend = backendUrl.replace(/\/$/, "");

    return [
      {
        source: "/hubs/:path*",
        destination: `${backend}/hubs/:path*`
      }
    ];
  }
};

export default nextConfig;
