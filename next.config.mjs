/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix font loading issues
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  
  // Fix CORS issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Font optimization
  fonts: {
    preload: true,
  },

  // Webpack configuration for font handling
  webpack: (config, { isServer }) => {
    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
        },
      },
    });

    return config;
  },
};

export default nextConfig;
