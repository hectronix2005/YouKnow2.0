import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@ffprobe-installer/ffprobe',
    '@ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg',
    '@xenova/transformers',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
