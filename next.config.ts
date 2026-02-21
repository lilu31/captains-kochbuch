import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hijtovcawskifuepfjgi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/recipe-images/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
      }
    ],
  },
};

export default nextConfig;
