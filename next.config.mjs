/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The legacy static prototype lives at /legacy/ in the repo for reference;
  // it is NOT served publicly by the Next.js app.
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Server Actions are enabled by default in Next 14.2; noted for adoption clarity.
  }
};

export default nextConfig;
