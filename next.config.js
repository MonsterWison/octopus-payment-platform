/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    // 排除後端文件夾
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**', '**/node_modules/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
