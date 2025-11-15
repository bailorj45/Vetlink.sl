/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // For Vercel deployment compatibility
  },
  eslint: {
    // Allow build to proceed with warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Allow build to proceed with type errors (if any)
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

