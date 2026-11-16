import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App é client-side (localStorage na v1); Cache Components/PPR não se aplica.
  // Será reavaliado quando o Supabase entrar com dados no servidor.
  cacheComponents: false,
  partialPrefetching: false,
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
