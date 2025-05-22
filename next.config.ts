import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // allow images from certain domains
    domains: ["res.cloudinary.com", "upload.wikimedia.org"],
  },
};

export default nextConfig;
