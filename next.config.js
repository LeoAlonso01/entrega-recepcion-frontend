/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDF.js usa el canvas nativo del navegador. Su dependencia opcional de
  // Node no debe incorporarse al visor que se ejecuta en el cliente.
  turbopack: {
    resolveAlias: { canvas: './lib/pdfCanvasStub.ts' },
  },
  webpack(config) {
    config.resolve.alias.canvas = false;
    return config;
  },
  env: {
    NEXT_PUBLIC_SERUMICH_STAGE_API_URL: process.env.SERUMICH_STAGE_API_URL || "",
  },
  compiler: {
    // Quitar logs de depuración del código de producción; conservar errores y advertencias.
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Configuración de rewrites mejorada
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: (process.env.SERUMICH_STAGE_API_URL || 'http://148.216.25.183:8000') + '/:path*',
      },
    ]
  },
  
  // Configuración de headers para seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Forwarded-Proto',
            value: 'https'
          },
          {
            key: 'X-Forwarded-Host',
            value: 'entrega-recepcion-frontend-n4u3.vercel.app'
          }
        ]
      }
    ]
  },
  
  // Configuración experimental para evitar mixed content
  experimental: {
    serverActions: {
      allowedOrigins: ['148.216.25.183:8000'],
    },
  }
};

module.exports = nextConfig;
