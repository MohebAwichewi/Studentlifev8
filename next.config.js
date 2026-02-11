/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ Essential for cPanel

  // ✅ Keeps these packages safe
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // ✅ Temporarily disabled to test build
  // webpack: (config, { isServer }) => {
  //   config.watchOptions = {
  //     ...config.watchOptions,
  //     ignored: ['**/mobile/**', '**/node_modules/**'],
  //   };
  //   return config;
  // },

  // ✅ Empty turbopack config to silence Next.js 16 warning
  turbopack: {},

  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;