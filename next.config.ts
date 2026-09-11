//import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
//  reactStrictMode: true,
//};

//export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
