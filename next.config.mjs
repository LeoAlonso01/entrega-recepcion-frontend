/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita el output standalone para Vercel (mejor para Docker y deployments optimizados)
  output: 'standalone',  // <-- Añade esta línea

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-entrega-recepcion.umich.mx/:path*',
      },
      {
        source: '/token',
        destination: 'https://api-entrega-recepcion.umich.mx/token',
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `connect-src 'self' https://api-entrega-recepcion.umich.mx http://148.216.25.183:8000`,
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "frame-src 'self'",
              "media-src 'self'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  }
};

export default nextConfig;