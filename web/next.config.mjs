/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → Cloudflare Workers (Static Assets). All CV data is read
  // from ../data at build time (lib/data.ts); nothing dynamic at runtime.
  // Security headers live in ./public/_headers (copied into out/), since
  // next.config `headers()` does not apply to a static export.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
