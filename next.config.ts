import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // One page, mostly first-time visitors: ship the CSS with the HTML instead of a blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
