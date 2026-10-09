import LabsMark from "@/components/brand/LabsMark";
import { Pill } from "@/components/ui/Pill";

export default function NotFound() {
  return (
    <section className="labs-page-top container grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <LabsMark variant="mono" className="mx-auto h-28 w-28 text-sand" />
        <h1 className="mt-8 text-4xl md:text-6xl">Experiment not found.</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">This page didn't make it out of the lab. The products that did are one click away.</p>
        <div className="mt-8"><Pill href="/">Back to Labs</Pill></div>
      </div>
    </section>
  );
}
