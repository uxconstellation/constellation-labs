import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LabsLogo from "@/components/brand/LabsLogo";
import Patch from "@/components/patches/Patch";
import StatusChip from "@/components/ui/StatusChip";
import { LINKS, products } from "@/content/products";
import { cn } from "@/lib/utils";

/**
 * Floats over the page, tucks away on scroll down, returns on scroll up.
 * Two doors stay in reach on every page: Invest and Build.
 */
export default function Nav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const dark = pathname === "/invest" && !scrolled;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 320 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-700 ease-lab",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          scrolled && !open ? "bg-paper/85 shadow-[0_1px_0_hsl(var(--ink)/.06)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className={cn("wrap flex h-[76px] items-center justify-between gap-6", dark && "text-paper")}>
          <Link to="/" aria-label="Constellation Labs, home" className="shrink-0">
            <LabsLogo className={dark ? "text-paper" : undefined} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            <Link className={cn("navlink", dark && "!text-paper/80 hover:!text-paper")} to="/#bench">Ventures</Link>
            <NavLink className={cn("navlink", dark && "!text-paper/80 hover:!text-paper")} to="/invest">Invest</NavLink>
            <NavLink className={cn("navlink", dark && "!text-paper/80 hover:!text-paper")} to="/build">Build</NavLink>
            <a className={cn("navlink", dark && "!text-paper/80 hover:!text-paper")} href={LINKS.studio} target="_blank" rel="noopener noreferrer">
              Studio <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/invest" className={cn("btn btn-sm", dark ? "btn-line-light" : "btn-line")}>Invest in Labs</Link>
            <Link to="/build" className="btn btn-sm btn-orange">Build yours</Link>
          </div>

          <button
            type="button"
            className={cn("relative z-[60] grid h-11 w-11 place-items-center rounded-full border lg:hidden", dark && !open ? "border-paper/30" : "border-ink/20 bg-paper/60")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span className={cn("absolute left-0 h-[2px] w-5 rounded bg-current transition-transform duration-500 ease-lab", open ? "top-[5px] rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-[2px] w-5 rounded bg-current transition-transform duration-500 ease-lab", open ? "top-[5px] -rotate-45" : "top-[10px]")} />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-cream lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="wrap flex min-h-full flex-col pb-10 pt-28">
              <p className="eyebrow">On the bench</p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {products.map((p, i) => (
                  <motion.li key={p.slug} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                    <Link to={`/${p.slug}`} className="flex flex-col items-start gap-3 rounded-3xl p-4" style={{ background: p.color }}>
                      <span className="patch w-16"><Patch slug={p.slug} /></span>
                      <span className="text-xl font-black tracking-tight">{p.name}</span>
                      <StatusChip status={p.status} />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                <Link to="/invest" className="btn btn-ink w-full">Invest in Labs</Link>
                <Link to="/build" className="btn btn-orange w-full">Have us build yours</Link>
                <a href={LINKS.studio} target="_blank" rel="noopener noreferrer" className="btn btn-line w-full">Visit the studio ↗</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
