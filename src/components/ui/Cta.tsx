import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "orange" | "ink" | "line" | "line-light";

/** Pill button. Internal paths use the router; anything with a scheme opens as a link. */
export default function Cta({ href, children, variant = "orange", small, className, arrow = true }: { href: string; children: ReactNode; variant?: Variant; small?: boolean; className?: string; arrow?: boolean }) {
  const cls = cn("btn", `btn-${variant}`, small && "btn-sm", className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <span className="arrow" aria-hidden="true">→</span>}
    </>
  );
  if (href.startsWith("#")) return <a className={cls} href={href}>{inner}</a>;
  const external = /^(https?:|mailto:)/.test(href);
  if (external) {
    const web = href.startsWith("http");
    return (
      <a className={cls} href={href} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
        {web && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return <Link className={cls} to={href}>{inner}</Link>;
}
