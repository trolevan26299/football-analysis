/** @type {import('next').NextConfig} */
const nextConfig = {
  postcss: false,
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    optimizeCss: true,
    optimisticClientCache: true,
    serverMinification: true,
    forceSwcTransforms: true,
    typedRoutes: true,
    turbo: {
      resolveAlias: {
        '@mui/icons-material/*': '@mui/icons-material/esm/*'
      }
    }
  }
};

export default nextConfig;
