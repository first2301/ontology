import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Docker용 standalone 빌드 활성화
  // API 프록시 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/:path*`,
      },
    ];
  },
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
