import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usar webpack en lugar de Turbopack para evitar problemas con módulos nativos
  // como @ffprobe-installer que contienen archivos no-JS
  experimental: {
    // Turbopack tiene problemas con algunos módulos de node_modules
  },
  webpack: (config, { isServer }) => {
    // Excluir módulos problemáticos del bundling del cliente
    if (!isServer) {
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
