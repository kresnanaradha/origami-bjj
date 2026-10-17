import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // kualitas gambar yang dipakai di halaman (default hanya 75)
  images: { qualities: [75, 85, 90] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
