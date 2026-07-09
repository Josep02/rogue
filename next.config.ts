import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el dev server desde el movil por IP local (LAN).
  allowedDevOrigins: ["192.168.1.59", "192.168.88.128"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/yuhonas/free-exercise-db/**",
      },
    ],
  },
};

export default nextConfig;
