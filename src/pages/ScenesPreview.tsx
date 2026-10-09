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
    <section className="wrap pb-16 pt-28">
      <meta name="robots" content="noindex" />
      <p className="eyebrow">Internal preview</p>
      <h1 className="d-l mb-10">Motion pieces</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((i) => (
          <div key={i.name} className="grain sheet p-8" style={{ background: i.bg }} data-scene={i.name.toLowerCase()}>
            <p className="eyebrow mb-4">{i.name}</p>
            {i.el}
          </div>
        ))}
      </div>
    </section>
  );
}
