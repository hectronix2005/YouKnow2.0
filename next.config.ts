import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    if(!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
      };
    }

    // Ignorar archivos .md en node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
  // Marcar paquetes de procesamiento de video como externos para el servidor
  serverExternalPackages: [
    '@ffprobe-installer/ffprobe',
    '@ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg',
    '@xenova/transformers',
  ],
};

export default nextConfig;
