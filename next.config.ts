import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,
  },
  images: {
    domains: [
      'static.fatcoupon.com', 
      's3-eu-west-1.amazonaws.com',
      'media.pepperjamnetwork.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};

export default nextConfig;
