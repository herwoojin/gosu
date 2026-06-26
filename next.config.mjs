/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-leaflet/@react-leaflet/core 는 ESM — App Router에서 안전하게 트랜스파일
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
  // Self-hosted fonts + Supabase storage images allowed
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
