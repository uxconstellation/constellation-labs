import { useParams } from "react-router-dom";
import StatusChip from "@/components/ui/StatusChip";
import Patch from "@/components/patches/Patch";
import { Pill } from "@/components/ui/Pill";
import { getProduct, nextProduct } from "@/content/products";
import NotFound from "./NotFound";

/** Scaffold version. Step 6 gives each product its own build and signature interaction. */
export default function ProductPage() {
  const { slug = "" } = useParams();
  const p = getProduct(slug);
  if (!p) return <NotFound />;
  const next = nextProduct(p.slug);

  return (
    <article className="labs-page-top landing-v3">
      <header className="container grid items-center gap-10 py-16 md:grid-cols-12 md:py-24"><div className="md:col-span-7">
        <StatusChip status={p.status} />
        <h1 className="mt-6 text-6xl md:text-8xl" style={{ color: p.slug === "prism" ? undefined : "hsl(var(--ink))" }}>{p.name}</h1>
        <p className="mt-5 max-w-[30ch] text-xl font-medium leading-snug md:text-2xl">{p.hook}</p>
        <div className="mt-8"><Pill href={p.cta.href} external={p.cta.external}>{p.cta.label}</Pill></div>
      </div>
        <div className="md:col-span-5"><Patch slug={p.slug} title={`${p.name} patch`} className="mx-auto w-full max-w-[420px]" /></div>
      </header>

      <section className="border-t border-line bg-mist">
        <div className="container grid gap-10 py-16 md:grid-cols-2">
          <div><p className="eyebrow">The problem</p><p className="mt-4 text-lg leading-relaxed">{p.problem}</p></div>
          <div>
            <p className="eyebrow">What it does</p>
            <ul className="mt-4 space-y-3">{p.capabilities.map((c) => <li key={c} className="border-b border-line pb-3">{c}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="container grid gap-10 py-16 md:grid-cols-3">
        <div><p className="eyebrow">Who it's for</p><ul className="mt-4 space-y-2 font-bold">{p.audiences.map((a) => <li key={a}>{a}</li>)}</ul></div>
        <div><p className="eyebrow">Built with</p><ul className="mt-4 flex flex-wrap gap-2">{p.stack.map((s) => <li key={s} className="rounded-full border border-line px-3 py-1 text-sm">{s}</li>)}</ul></div>
        <div><p className="eyebrow">Where it's at</p><p className="mt-4">{p.now}</p><p className="mt-1 text-ink-soft">Next: {p.next}</p></div>
      </section>

      <section className="container flex flex-wrap items-center justify-between gap-6 border-t border-line py-14">
        <Pill href={p.cta.href} external={p.cta.external}>{p.cta.label}</Pill>
        <Pill href={`/${next.slug}`} tone="ghost">Next experiment: {next.name}</Pill>
      </section>
    </article>
  );
}
