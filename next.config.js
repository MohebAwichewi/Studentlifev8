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



  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;