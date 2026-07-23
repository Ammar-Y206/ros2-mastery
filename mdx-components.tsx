import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { TerminalBlock } from "@/components/mdx/TerminalBlock";
import { Quiz } from "@/components/mdx/Quiz";
import { InteractiveGraph } from "@/components/mdx/InteractiveGraph";
import { StepByStepCode } from "@/components/mdx/StepByStepCode";
import { SimulatedTerminal } from "@/components/mdx/SimulatedTerminal";
import { ComparisonSlider } from "@/components/mdx/ComparisonSlider";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    CodeBlock,
    TerminalBlock,
    Quiz,
    InteractiveGraph,
    StepByStepCode,
    SimulatedTerminal,
    ComparisonSlider,
  };
}
