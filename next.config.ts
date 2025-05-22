import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "upload.wikimedia.org"],
  },
};

export default nextConfig;
