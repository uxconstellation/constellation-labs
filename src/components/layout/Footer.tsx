import { Link } from "react-router-dom";
import PatchPile from "./PatchPile";
import { LINKS, products } from "@/content/products";

/** Google Labs' closing move, in our thread: a pile of patches over a full-width wordmark. */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-paper">
      <div className="wrap pt-10">
        <PatchPile height={340} />
      </div>
      <div className="wrap">
        <div className="grid gap-10 border-t hairline py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <p className="max-w-xs text-[15px] leading-relaxed text-ink-soft">
            The products wing of Constellation, a design and build studio in George, South Africa.
          </p>
          <FooterCol title="On the bench">
            {products.map((p) => <li key={p.slug}><Link className="navlink" to={`/${p.slug}`}>{p.name}</Link></li>)}
          </FooterCol>
          <FooterCol title="Two doors">
            <li><Link className="navlink" to="/invest">Invest in Labs</Link></li>
            <li><Link className="navlink" to="/build">Have us build yours</Link></li>
          </FooterCol>
          <FooterCol title="Talk to us">
            <li><a className="navlink" href={LINKS.email}>aldo@uxconstellation.com</a></li>
            <li><a className="navlink" href={LINKS.studio} target="_blank" rel="noopener noreferrer">uxconstellation.com ↗</a></li>
          </FooterCol>
        </div>
      </div>
      <div className="wrap">
        <p
          aria-hidden="true"
          className="whitespace-nowrap border-t hairline pt-6 font-black leading-[.8] tracking-[-0.065em] text-ink"
          style={{ fontSize: "clamp(38px, 11.2vw, 161px)" }}
        >
          Constellation <span className="text-orange-ink">Labs</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t hairline py-6 text-[13px] text-ink-soft mt-8">
          <span>© {new Date().getFullYear()} Constellation Lab (Pty) Ltd</span>
          <span>Made in George, South Africa</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="grid gap-2 text-[15px]">{children}</ul>
    </div>
  );
}
