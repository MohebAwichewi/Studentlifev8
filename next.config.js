/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Output standalone (Crucial for cPanel)
  output: 'standalone',

  // 2. Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Images Configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;