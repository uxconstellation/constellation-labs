import type { ElementType, ReactNode } from "react";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import { cn } from "@/lib/utils";

type Tone = "ink" | "ember" | "day";

/**
 * A rounded sheet on the brand liquid. "ink" carries the main site's night disc
 * rising out of the corner; "ember" and "day" are washed, grained fields.
 */
export default function LiquidSheet({ tone, as: Tag = "div", className, children, ...rest }: { tone: Tone; as?: ElementType; className?: string; children: ReactNode; [k: string]: unknown }) {
  return (
    <Tag className={cn("sheet relative isolate overflow-hidden", tone === "ink" ? "bg-ink text-paper" : "bg-cream", className)} {...rest}>
      {tone === "ink" ? (
        <div aria-hidden="true" className="absolute -right-[30%] -top-[34%] -z-10 aspect-square w-[105%] min-w-[420px]">
          <Liquid shape="disc" palette={PALETTES.night} bg="#160C15" grain={0.12} className="h-full w-full" />
        </div>
      ) : (
        <Liquid palette={tone === "ember" ? PALETTES.ember : PALETTES.day} bg="#F3EEE7" wash={0.64} grain={0.11} speed={0.25} scale={1.8} resolution={0.45} className="absolute inset-0 -z-10 h-full w-full" />
      )}
      {children}
    </Tag>
  );
}

export const TONES: Tone[] = ["ink", "ember", "day"];
