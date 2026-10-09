import wordmark from "@/assets/constellation-wordmark.svg";
import LabsMark from "./LabsMark";
import { cn } from "@/lib/utils";

/** Lockup: Labs mark, the real Constellation wordmark (recoloured via mask), and the LABS tag. */
export default function LabsLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)} role="img" aria-label="Constellation Labs">
      <LabsMark variant={compact ? "small" : "color"} className={compact ? "h-8 w-8" : "h-10 w-10 md:h-11 md:w-11"} title="" />
      <span
        aria-hidden="true"
        className="block h-[20px] w-[72px] bg-current"
        style={{ WebkitMask: `url(${wordmark}) left center / contain no-repeat`, mask: `url(${wordmark}) left center / contain no-repeat` }}
      />
      <span aria-hidden="true" className="rounded-full border-[1.5px] border-current px-2.5 py-1 text-[11px] font-black tracking-[0.32em]">
        LABS
      </span>
    </span>
  );
}
