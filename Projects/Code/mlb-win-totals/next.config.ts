import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=900, stale-while-revalidate=1800' },
        ],
      },
    ];
  },
};

export default nextConfig;
