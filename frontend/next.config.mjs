// next.config.mjs
import stylexPlugin from '@stylexjs/nextjs-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, // Enables styled-components support
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  devIndicators: false,
  experimental: {
    turbo: {
      // Turbopack configuration options go here
      resolveAlias: {},
      loaders: {}
    }
  }
};

// Apply the StyleX plugin to the configuration
const config = stylexPlugin({
  rootDir: new URL('.', import.meta.url).pathname, // Use ES modules path resolution
  useCSSLayers: true, // Enables CSS cascade layers for better style management
})(nextConfig);

export default config;