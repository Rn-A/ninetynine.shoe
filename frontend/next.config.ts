import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5001/api/:path*", // Proxy ke Express Backend
      },
    ];
  },
};

export default nextConfig;
