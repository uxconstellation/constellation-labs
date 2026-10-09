import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import LabsLogo from "@/components/brand/LabsLogo";
import { LINKS, products } from "@/content/products";

/** Duplicated from the Constellation navbar: same structure, pills, scroll state and menu. Labs links. */
const sectionLinks = [
  { label: "How it works", href: "#process" },
  { label: "Questions", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const desktopProducts = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const current = products.find((p) => location.pathname === `/${p.slug}`);
  const triggerLabel = current?.name ?? "Products";
  const productsStyle = `flex items-center gap-2 rounded-full border px-5 py-1.5 font-body text-xs font-bold uppercase tracking-wider no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${current ? "border-primary/60 text-ink bg-primary/[0.12]" : "border-foreground/20 text-foreground/70 hover:border-primary/50"}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setProductsOpen(false); setMenuOpen(false); }, [location.pathname]);

  const handleHash = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 450);
    } else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Main navigation"
      onKeyDown={(e) => { if (e.key === "Escape") { if (productsOpen) { setProductsOpen(false); desktopProducts.current?.focus(); } else { setMenuOpen(false); menuTrigger.current?.focus(); } } }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled || !isHome || menuOpen ? "border-b border-border/60 bg-background/95 shadow-[0_10px_30px_-20px_hsl(var(--ink)/.25)] backdrop-blur-lg" : "bg-transparent"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        <Link to="/" aria-label="Constellation Labs home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <LabsLogo />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setProductsOpen(true); }}
            onMouseLeave={() => setProductsOpen(false)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setProductsOpen(false); }}
          >
            <button
              ref={desktopProducts}
              type="button"
              aria-expanded={productsOpen}
              aria-controls="desktop-products"
              onClick={(e) => { if (e.detail === 0) setProductsOpen(true); else setProductsOpen((o) => !o); }}
              className={productsStyle}
            >
              <span>{triggerLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${productsOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {productsOpen && (
              <div id="desktop-products" className="absolute left-0 top-full w-72 pt-3">
                <div className="rounded-2xl border border-border bg-background p-3 shadow-lg">
                  {products.map((p) => (
                    <Link key={p.slug} to={`/${p.slug}`} aria-current={current?.slug === p.slug ? "page" : undefined} className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 font-body text-sm no-underline transition-colors hover:bg-cream aria-[current=page]:bg-cream">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-xs text-ink-soft">{p.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleHash(e, link.href)} className="font-body text-sm text-foreground/70 transition-colors duration-200 hover:text-orange-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              {link.label}
            </a>
          ))}

          <a href={LINKS.studio} target="_blank" rel="noopener noreferrer" className="rounded-full border border-foreground/20 px-5 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-foreground/70 transition-all duration-200 hover:border-primary/50">
            Studio
          </a>
          <a href={LINKS.studioContact} target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary px-6 py-2 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:scale-105 hover:brightness-110">
            Build yours
          </a>
        </div>

        <button
          ref={menuTrigger}
          type="button"
          aria-controls="mobile-navigation"
          className="flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block h-0.5 w-6 bg-foreground transition-transform duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-foreground transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-foreground transition-transform duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      <div id="mobile-navigation" hidden={!menuOpen} className="max-h-[80vh] overflow-y-auto border-b border-border bg-background/95 backdrop-blur-lg lg:hidden">
        <div className="flex flex-col gap-4 px-6 py-6">
          {products.map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="flex items-center justify-between font-body text-base text-foreground/80">
              {p.name}<span className="text-xs text-ink-soft">{p.status}</span>
            </Link>
          ))}
          <div className="h-px bg-border" />
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleHash(e, link.href)} className="font-body text-base text-foreground/70">{link.label}</a>
          ))}
          <a href={LINKS.studio} target="_blank" rel="noopener noreferrer" className="font-body text-base text-foreground/70">Constellation studio</a>
          <a href={LINKS.studioContact} target="_blank" rel="noopener noreferrer" className="mt-2 w-full rounded-full bg-primary px-6 py-2.5 text-center font-body text-sm font-bold uppercase tracking-wider text-primary-foreground">
            Build yours
          </a>
        </div>
      </div>
    </nav>
  );
}
