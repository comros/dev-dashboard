/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep dev file watching inside frontend only (helps on Windows + monorepos)
  turbopack: {
    root: import.meta.dirname,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/.agents/**',
          '**/.next/**',
          '**/node_modules/**',
        ],
      }
    }
    return config
  },
}

export default nextConfig
