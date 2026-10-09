import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import { SCENES } from "@/components/scenes";
import { products, type ProductSlug } from "@/content/products";
import acreReal from "@/assets/real/acre.webp";
import pinpointsReal from "@/assets/real/pinpoints.webp";

gsap.registerPlugin(ScrollTrigger);

/**
 * Duplicated from the Constellation "From idea to live" build journey: sticky stage,
 * rounded-inset reveal, giant word, chapter pills and the mobile rail.
 * Deviation: four products instead of three phases, and each product's patch is the art.
 */
const chapters: { slug: ProductSlug; word: string; title: string; copy: string; items: string[]; name: string }[] = [
  {
    slug: "acre",
    word: "Acre.",
    title: "Every property deal, in one place.",
    copy: "Buy, sell or rent through an agent, or manage your own short and long-term rentals yourself. FICA and RICA checks, messages and every step of the deal live in one app, so everyone can see where it stands.",
    items: ["Buy, sell and rent", "FICA and RICA in the app", "Agency management"],
    name: "Property, end to end",
  },
  {
    slug: "pinpoints",
    word: "Pinpoints.",
    title: "Feedback that points at the thing.",
    copy: "Drop a pin on a website, PDF, video or image and leave the comment where it belongs. On live sites, clients can change the copy, a colour or an image right on the page, and it becomes a suggestion you approve, never a change to your code.",
    items: ["Websites, PDFs, video and images", "Suggest edits in place", "Approve and resolve"],
    name: "Visual review and sign-off",
  },
  {
    slug: "prism",
    word: "Prism.",
    title: "Hand over a site your client can edit.",
    copy: "A headless CMS that attaches to sites built on vibe-coding platforms. Clients get a Wix-like editor for their words, images and sections. Your code and your design stay exactly as you built them.",
    items: ["Attaches to vibe-coded sites", "Visual editing for clients", "Code stays untouched"],
    name: "Editing for vibe-coded sites",
  },
  {
    slug: "nod",
    word: "Nod.",
    title: "Meet the people you already sit next to.",
    copy: "Check in at a coffee shop or coworking space with the QR code on your table, say whether you're open to chat, and send a nod. If it's mutual, you're connected, with the venue and date saved.",
    items: ["QR check-in", "Open to chat or working quietly", "Mutual nods only"],
    name: "Networking, in the room",
  },
];

const statusOf = (slug: ProductSlug) => products.find((p) => p.slug === slug)!.status;

/** Real product proof, only where a real screen exists. */
const REAL: Partial<Record<ProductSlug, { src: string; url: string; caption: string }>> = {
  acre: { src: acreReal, url: "acreprop.lovable.app", caption: "The live product" },
  pinpoints: { src: pinpointsReal, url: "Pinpoints widget", caption: "The real widget, on a demo site" },
};

export default function ProductJourney() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const [beat, setBeat] = useState({ index: -1, label: "" });
  const rail = useRef<HTMLDivElement>(null);
  const total = String(chapters.length).padStart(2, "0");

  const selectChapter = (index: number) => {
    const node = rail.current;
    const cards = node?.querySelectorAll<HTMLElement>(".journey-chapter");
    if (!node || !cards?.[index]) return;
    node.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const syncChapter = () => {
    const node = rail.current;
    if (!node) return;
    const cards = Array.from(node.querySelectorAll<HTMLElement>(".journey-chapter"));
    const first = cards[0]?.offsetLeft || 0;
    const distances = cards.map((card) => Math.abs(card.offsetLeft - first - node.scrollLeft));
    const index = distances.indexOf(Math.min(...distances));
    if (index >= 0) setMobileActive(index);
  };

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray<HTMLElement>(".journey-chapter");
        sections.forEach((section, index) => {
          ScrollTrigger.create({ trigger: section, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) });
          gsap.fromTo(section.querySelector(".journey-chapter-copy"), { y: 45, opacity: 0.35 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 85%", end: "top 45%", scrub: 0.6 } });
        });
        gsap.fromTo(".journey-stage", { clipPath: "inset(8% 8% round 150px)" }, { clipPath: "inset(0% 0% round 28px)", scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 20%", scrub: 1 }, ease: "none" });
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, []);

  return (
    <section id="products" ref={root} className="build-journey labs-journey landing-section">
      <div className="landing-container">
        <div className="journey-heading">
          <div>
            <p className="landing-eyebrow">On the bench</p>
            <h2 className="landing-display">Four products.<br />Watch them work.</h2>
          </div>
          <p className="landing-lead">
            <span className="journey-desktop-lead">Each one fixes a problem<br />we kept hitting.<br />Here is what it does.</span>
            <span className="journey-mobile-lead">Each one fixes a problem we kept hitting.</span>
          </p>
        </div>

        <div className="journey-mobile-nav" aria-label="Choose a product">
          {chapters.map((chapter, index) => (
            <button type="button" key={chapter.slug} aria-pressed={mobileActive === index} aria-controls={`journey-${index}`} onClick={() => selectChapter(index)}>
              <span>0{index + 1}</span>{chapter.word.replace(".", "")}
            </button>
          ))}
        </div>

        <div className="journey-layout">
          <div className="journey-sticky">
            <div className={`journey-stage labs-stage stage-${chapters[active].slug}`}>
              <div className="card-grain" aria-hidden="true" />
              <div className="journey-stage-top labs-stage-top">
                <span className="labs-stage-id"><span className="labs-stage-patch"><Patch slug={chapters[active].slug} /></span>{chapters[active].word.replace(".", "")}<i>{statusOf(chapters[active].slug)}</i></span>
                <span>0{active + 1} / {total}</span>
              </div>
              {chapters.map((chapter, index) => {
                const Piece = SCENES[chapter.slug];
                return (
                  <div key={chapter.slug} className={`journey-visual labs-stage-visual ${active === index ? "is-active" : ""}`} aria-hidden={active !== index}>
                    <div className="labs-stage-scene">
                      <Piece showBeats={false} active={active === index} onBeat={active === index ? (i, label) => setBeat({ index: i, label }) : undefined} />
                    </div>
                  </div>
                );
              })}
              <div className="journey-stage-bottom labs-stage-bottom" aria-live="off">
                <span key={beat.label} className="labs-stage-beat">{beat.index >= 0 ? <><i>0{beat.index + 1}</i>{beat.label}</> : chapters[active].name}</span>
                <ArrowDown size={20} />
              </div>
            </div>
            <div className="journey-step-nav" aria-label="Products">
              {chapters.map((chapter, index) => (
                <a href={`#journey-${index}`} key={chapter.slug} aria-current={active === index ? "step" : undefined}>
                  <span>0{index + 1}</span>{chapter.word.replace(".", "")}
                </a>
              ))}
            </div>
          </div>

          <div ref={rail} className="journey-chapters" onScroll={syncChapter}>
            {chapters.map((chapter, index) => (
              <article className={`journey-chapter labs-chapter-${chapter.slug} ${mobileActive === index ? "mobile-chapter-active" : ""}`} id={`journey-${index}`} key={chapter.slug}>
                <div className="journey-mobile-art labs-mobile-scene">
                  <div className="card-grain" aria-hidden="true" />
                  {(() => { const Piece = SCENES[chapter.slug]; return <Piece showBeats={false} />; })()}
                </div>
                <div className="journey-chapter-copy">
                  <p className="landing-eyebrow">0{index + 1} / {statusOf(chapter.slug)}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.copy}</p>
                  <ul>{chapter.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  {REAL[chapter.slug] && (
                    <figure className="labs-real">
                      <div className="labs-real-frame">
                        <div className="labs-real-bar"><i /><i /><i /><em>{REAL[chapter.slug]!.url}</em></div>
                        <img src={REAL[chapter.slug]!.src} alt={`${chapter.word.replace(".", "")}, ${REAL[chapter.slug]!.caption.toLowerCase()}`} loading="lazy" width={960} height={600} />
                      </div>
                      <figcaption><span className="labs-real-dot" />{REAL[chapter.slug]!.caption}</figcaption>
                    </figure>
                  )}
                  <Link to={`/${chapter.slug}`} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-8 py-3 font-body text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:brightness-110 motion-reduce:hover:scale-100">
                    Explore {chapter.word.replace(".", "")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="journey-mobile-position" aria-hidden="true"><span style={{ transform: `translateX(${mobileActive * 100}%)` }} /></div>
        <div className="journey-footnote"><span>Illustrations show how each product works. Names and figures in them are made up.</span><span>Status shown on every product.</span></div>
      </div>
    </section>
  );
}
