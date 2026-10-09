import { Link } from "react-router-dom";
import LabsLogo from "@/components/brand/LabsLogo";
import { LINKS, products } from "@/content/products";

/** Duplicated from the Constellation footer: same columns, type and rule. Labs links. */
export default function Footer() {
  return (
    <footer className="labs-footer border-t border-border px-6 py-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <LabsLogo compact />
            <p className="mt-4 max-w-xs font-body text-sm text-foreground/80">The products wing of Constellation. Built for our studio first, then opened up.</p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-body text-xs font-bold tracking-widest text-foreground/90">PRODUCTS</h4>
              <nav className="mt-3 flex flex-col gap-2" aria-label="Products">
                {products.map((p) => (
                  <Link key={p.slug} to={`/${p.slug}`} className="font-body text-sm text-foreground/85 transition-colors hover:text-orange-ink">{p.name}</Link>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="font-body text-xs font-bold tracking-widest text-foreground/90">STUDIO</h4>
              <nav className="mt-3 flex flex-col gap-2" aria-label="Constellation studio">
                <a href={LINKS.studio} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-foreground/85 transition-colors hover:text-orange-ink">Constellation</a>
                <a href={LINKS.studioContact} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-foreground/85 transition-colors hover:text-orange-ink">Contact</a>
                <a href="https://www.linkedin.com/company/uxconstellation" target="_blank" rel="noopener noreferrer" className="font-body text-sm text-foreground/85 transition-colors hover:text-orange-ink">LinkedIn</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center font-body text-xs text-foreground/70">
          &copy; {new Date().getFullYear()} Constellation. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
