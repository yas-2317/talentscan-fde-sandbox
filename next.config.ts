import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid picking up lockfiles outside this repository during local development.
    root: __dirname,
  },
};

export default nextConfig;
