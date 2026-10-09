import { statusDot, type ProductStatus } from "@/content/products";
import { cn } from "@/lib/utils";

export default function StatusChip({ status, className }: { status: ProductStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-bold", className)}>
      <i className="h-[7px] w-[7px] rounded-full" style={{ background: statusDot[status] }} aria-hidden="true" />
      {status}
    </span>
  );
}
