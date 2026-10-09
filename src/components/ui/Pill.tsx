import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const pill = cva(
  "inline-flex min-h-11 items-center gap-2 rounded-full font-bold text-[15px] transition-[transform,background-color,box-shadow,color] duration-300 ease-lab active:scale-[.98]",
  {
    variants: {
      tone: {
        primary: "bg-orange px-6 py-3 text-ink hover:shadow-lift hover:-translate-y-0.5",
        secondary: "border-[1.5px] border-ink px-6 py-3 text-ink hover:bg-ink hover:text-paper",
        ghost: "px-1 text-orange-ink hover:gap-3",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

type Props = VariantProps<typeof pill> & {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Pill link. External links open in a new tab and show an outward arrow. */
export const Pill = forwardRef<HTMLAnchorElement, Props>(({ href, external, tone, children, className }, ref) => {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const cls = cn(pill({ tone }), className);
  const content = (
    <>
      {children}
      <Icon className="h-4 w-4" aria-hidden="true" />
    </>
  );
  if (external)
    return (
      <a ref={ref} href={href} className={cls} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
        {content}
      </a>
    );
  return (
    <Link ref={ref} to={href} className={cls}>
      {content}
    </Link>
  );
});
Pill.displayName = "Pill";
