// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'),
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      'your-super-secret-jwt-key-that-is-at-least-32-characters-long',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizeCss: true,
  },
  // Optimize font loading
  optimizeFonts: true,
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Disable x-powered-by header for security
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
