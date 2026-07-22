import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { TerminalBlock } from "@/components/mdx/TerminalBlock";
import { Quiz } from "@/components/mdx/Quiz";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    CodeBlock,
    TerminalBlock,
    Quiz,
  };
}
