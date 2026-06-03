import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speed up dev by skipping type checks during compilation
  // (run tsc --noEmit separately when needed)
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },

  // Only compile changed files
  experimental: {
    optimizePackageImports: ["lucide-react", "@hookform/resolvers"],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Reduce image processing overhead in dev
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
