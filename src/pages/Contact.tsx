import { useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import Patch from "@/components/patches/Patch";
import Cta from "@/components/ui/Cta";
import { getJourney } from "@/lib/journey";
import { useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Every "get in touch" on Labs lands here, so the lead stays on Labs and carries its path. */
const INTENTS = [
  { id: "invest", label: "Invest in Labs", title: "Talk to Aldo about backing Labs.", patch: null },
  { id: "build", label: "Have us build yours", title: "Tell us what you want built.", patch: null },
  { id: "prism", label: "Book a Prism demo", title: "Book a Prism demo.", patch: "prism" },
  { id: "pinpoints", label: "Pinpoints invite", title: "Ask for a Pinpoints invite.", patch: "pinpoints" },
  { id: "nod", label: "Join the Nod pilot", title: "Bring Nod to your venue.", patch: "nod" },
  { id: "acre", label: "Acre", title: "Talk to us about Acre.", patch: "acre" },
  { id: "other", label: "Something else", title: "Say hello.", patch: null },
] as const;

type State = "idle" | "sending" | "sent" | "failed";

export default function Contact() {
  const root = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const initial = INTENTS.find((i) => i.id === params.get("intent"))?.id ?? "other";
  const [intent, setIntent] = useState<string>(initial);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const id = useId().replace(/:/g, "");
  const current = INTENTS.find((i) => i.id === intent)!;
  const product = params.get("product") ?? "";
  const mailFallback = useMemo(() => `mailto:aldo@uxconstellation.com?subject=${encodeURIComponent(`Labs: ${current.label}`)}`, [current.label]);
  useMotion(root);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Add an email address we can reply to."); return; }
    setError(""); setState("sending");
    const j = getJourney();
    const pages = j.pages.filter((p) => !p.startsWith("/contact"));
    const payload = {
      ...Object.fromEntries(form.entries()),
      intent,
      from: pages[pages.length - 1] ?? "direct to /contact",
      landing: j.landing,
      referrer: j.referrer,
      utm: Object.entries(j.utm).map(([k, v]) => `${k}=${v}`).join(" ") || "-",
      pages: j.pages.join(" > "),
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      setState(data.delivered ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  return (
    <div ref={root}>
      <section aria-labelledby="ct-title" className="relative overflow-hidden rounded-b-[clamp(28px,3vw,44px)] bg-cream pb-20 pt-[120px] md:pb-28 md:pt-[150px]">
        <Liquid palette={PALETTES.day} bg="#F3EEE7" wash={0.62} grain={0.11} speed={0.28} scale={2.2} resolution={0.5} className="absolute inset-0 h-full w-full" />
        <div className="wrap relative grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h1 id="ct-title" className="d-hero mt-6 max-w-[11ch]">{current.title}</h1>
            <p className="lede mt-6 max-w-[28rem]">Aldo reads every message himself and replies from aldo@uxconstellation.com, usually within a working day.</p>
            {current.patch && (
              <div className="patch patch-shadow mt-10 hidden w-[150px] rotate-[-8deg] lg:block" aria-hidden="true"><Patch slug={current.patch} /></div>
            )}
          </div>

          <div className="rounded-[28px] border border-ink/10 bg-[#FCFAF6] p-6 shadow-float backdrop-blur md:p-10">
            {state === "sent" ? (
              <div role="status" className="py-10">
                <p className="eyebrow">Sent</p>
                <p className="d-m mt-4">Thank you. It's with Aldo.</p>
                <p className="lede mt-4">He'll reply to the address you gave. In the meantime, the bench is open.</p>
                <div className="mt-8 flex flex-wrap gap-3"><Cta href="/#bench" variant="ink">Back to the ventures</Cta></div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <fieldset>
                  <legend className="eyebrow">What's this about?</legend>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {INTENTS.map((i) => (
                      <button key={i.id} type="button" aria-pressed={intent === i.id} onClick={() => setIntent(i.id)}
                        className={cn("h-10 rounded-full border px-4 text-[14px] font-bold transition-colors", intent === i.id ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper hover:border-ink")}>
                        {i.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <Field id={`${id}-name`} name="name" label="Your name" autoComplete="name" />
                  <Field id={`${id}-email`} name="email" label="Email" type="email" autoComplete="email" required aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined} />
                  <Field id={`${id}-company`} name="company" label={intent === "nod" ? "Venue" : "Company"} autoComplete="organization" className="md:col-span-2" />
                  {product && <input type="hidden" name="product" value={product.slice(0, 60)} />}
                  <div className="md:col-span-2">
                    <label htmlFor={`${id}-msg`} className="text-[13px] font-bold">Message</label>
                    <textarea id={`${id}-msg`} name="message" rows={5} defaultValue={product ? `We'd like to build ${product}.` : ""}
                      className="mt-2 block w-full resize-y rounded-2xl border border-ink/25 bg-paper px-4 py-3 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-ink focus:shadow-[0_0_0_3px_rgba(194,65,12,.35)]" />
                  </div>
                  {/* Honeypot: hidden from people and assistive tech, filled by bots */}
                  <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                    <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                  </div>
                </div>

                {error && <p id={`${id}-err`} role="alert" className="mt-5 text-[14.5px] font-bold text-orange-ink">{error}</p>}
                {state === "failed" && (
                  <p role="alert" className="mt-5 text-[14.5px] text-ink">
                    That didn't send, and we'd rather tell you than pretend. <a className="font-bold text-orange-ink underline" href={mailFallback}>Email Aldo directly</a> instead.
                  </p>
                )}
                <button type="submit" disabled={state === "sending"} className="btn btn-orange mt-8 w-full md:w-auto disabled:opacity-60">
                  {state === "sending" ? "Sending…" : "Send to Aldo"} <span className="arrow" aria-hidden="true">→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ id, label, className, ...rest }: { id: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[13px] font-bold">{label}{rest.required && <span className="text-orange-ink"> *</span>}</label>
      <input id={id} {...rest} className="mt-2 block h-12 w-full rounded-2xl border border-ink/25 bg-paper px-4 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-ink focus:shadow-[0_0_0_3px_rgba(194,65,12,.35)] aria-[invalid=true]:border-orange-ink" />
    </div>
  );
}
