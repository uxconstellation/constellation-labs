import AcreScene from "@/components/scenes/AcreScene";
import PinpointsScene from "@/components/scenes/PinpointsScene";
import PrismScene from "@/components/scenes/PrismScene";
import NodScene from "@/components/scenes/NodScene";

/** Internal review page for the four motion pieces. Not linked from the site. */
export default function ScenesPreview() {
  const items = [
    { name: "Acre", bg: "#d2d9c7", el: <AcreScene /> },
    { name: "Pinpoints", bg: "#f0c0a1", el: <PinpointsScene /> },
    { name: "Prism", bg: "#d8d1df", el: <PrismScene /> },
    { name: "Nod", bg: "#b3d3c6", el: <NodScene /> },
  ];
  return (
    <section className="labs-page-top landing-container py-16">
      <meta name="robots" content="noindex" />
      <p className="landing-eyebrow">Internal preview</p>
      <h1 className="landing-display mb-10">Motion pieces</h1>
      <div className="labs-scenes-grid">
        {items.map((i) => (
          <div key={i.name} style={{ background: i.bg }} data-scene={i.name.toLowerCase()}>
            <div className="card-grain" aria-hidden="true" />
            <p className="landing-eyebrow mb-4">{i.name}</p>
            {i.el}
          </div>
        ))}
      </div>
    </section>
  );
}
