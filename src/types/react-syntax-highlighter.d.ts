declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: { [key: string]: React.CSSProperties };
    customStyle?: React.CSSProperties;
    children: string;
    showLineNumbers?: boolean;
    lineNumberStyle?: React.CSSProperties;
    wrapLongLines?: boolean;
    [key: string]: unknown;
  }

  const SyntaxHighlighter: React.ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
  export const Light: React.ComponentType<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism/one-dark" {
  import type { PrismTheme } from "react-syntax-highlighter";
  const theme: PrismTheme;
  export default theme;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus" {
  import type { PrismTheme } from "react-syntax-highlighter";
  const theme: PrismTheme;
  export default theme;
}
