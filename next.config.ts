import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['files.catbox.moe', 'raw.githubusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
