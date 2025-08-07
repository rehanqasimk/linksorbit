import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,
  },
};

export default nextConfig;
