import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // شيلنا output: "standalone" لأن Vercel مش محتاجه، وده اللي كان بيسبب مشاكل ال cp -r
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // الحل السحري: شيلنا ال import وقولنا ل Turbopack اسم ال Plugin ك String
    remarkPlugins: ["remark-gfm", "remark-heading-id"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);