import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-gfm", "remark-heading-id"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);