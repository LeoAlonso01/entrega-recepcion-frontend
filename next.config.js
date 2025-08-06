/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: 'http://148.216.25.183:8000/:path*',
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