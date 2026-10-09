import LabsMark from "@/components/brand/LabsMark";
import Cta from "@/components/ui/Cta";

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[80svh] place-items-center pb-16 pt-32 text-center">
      <div>
        <LabsMark variant="mono" className="mx-auto h-28 w-28 rotate-12 text-sand" title="" />
        <h1 className="d-l mt-8">Experiment not found.</h1>
        <p className="lede mx-auto mt-5 max-w-md">This page didn't make it out of the lab. The products that did are one click away.</p>
        <div className="mt-9 flex justify-center gap-3">
          <Cta href="/" variant="ink">Back to Labs</Cta>
        </div>
      </div>
    </section>
  );
}
