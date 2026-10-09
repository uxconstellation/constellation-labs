import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const THREADS = [
  { name: "Orange", body: "#FE6E36", edge: "#D9541F" },
  { name: "Teal", body: "#173F3F", edge: "#0E2B2B" },
  { name: "Acre green", body: "#2F6B4F", edge: "#24563F" },
  { name: "Ink", body: "#160C15", edge: "#000000" },
];

/**
 * "Your patch goes here." Type a product name and pick a thread, and the studio
 * sews you a patch in the same hand as the four on the bench.
 * Uses the shared embroidery filters from <PatchDefs />.
 */
export default function PatchMaker({ emailTo }: { emailTo: string }) {
  const [name, setName] = useState("");
  const [thread, setThread] = useState(0);
  const id = useId().replace(/:/g, "");
  const t = THREADS[thread];
  const label = (name.trim() || "Your product").slice(0, 22);
  const fs = label.length > 14 ? 24 : label.length > 9 ? 30 : 38;
  const mail = `${emailTo}?subject=${encodeURIComponent(`A build for ${name.trim() || "my product"}`)}`;

  return (
    <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
      <div className="mx-auto w-full max-w-[420px]">
        <svg viewBox="0 0 400 400" className="w-full overflow-visible patch-shadow" role="img" aria-label={`A patch reading ${label}`}>
          <defs>
            <path id={`${id}-arc`} d="M 92 214 A 108 108 0 0 0 308 214" />
            <clipPath id={`${id}-in`}><circle cx="200" cy="200" r="150" /></clipPath>
          </defs>
          <g filter="url(#pt-lift)">
            <circle cx="200" cy="200" r="172" fill={t.body} style={{ transition: "fill .6s" }} />
            <circle cx="200" cy="200" r="172" fill="none" stroke={t.edge} strokeWidth="16" strokeDasharray="1.6 2.6" style={{ transition: "stroke .6s" }} />
            <circle cx="200" cy="200" r="156" fill="#FBF7F1" />
            <circle cx="200" cy="200" r="156" fill="url(#pt-twill)" />
          </g>
          <g clipPath={`url(#${id}-in)`} filter="url(#pt-emb)">
            <path d="M200 92 C206 132 222 148 262 154 C222 160 206 176 200 216 C194 176 178 160 138 154 C178 148 194 132 200 92 Z" fill={t.body} style={{ transition: "fill .6s" }} />
            <path d="M200 92 C206 132 222 148 262 154 C222 160 206 176 200 216 C194 176 178 160 138 154 C178 148 194 132 200 92 Z" fill="url(#pt-satin)" />
          </g>
          <circle cx="200" cy="200" r="144" fill="none" stroke={t.body} strokeWidth="2.4" strokeDasharray="7 6" opacity=".6" style={{ transition: "stroke .6s" }} />
          <text fontFamily="Satoshi, sans-serif" fontWeight="900" fontSize={fs} letterSpacing="3" fill={t.body} filter="url(#pt-emb)" style={{ transition: "fill .6s" }}>
            <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">{label.toUpperCase()}</textPath>
          </text>
          <text x="200" y="318" textAnchor="middle" fontFamily="Satoshi, sans-serif" fontWeight="700" fontSize="13" letterSpacing="4" fill="#5E5660">MADE WITH CONSTELLATION</text>
        </svg>
      </div>

      <div>
        <label htmlFor={`${id}-name`} className="eyebrow">What are we building?</label>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={22}
          placeholder="Your product name"
          autoComplete="off"
          className="mt-3 block w-full border-b-2 border-ink/20 bg-transparent pb-3 text-[clamp(28px,3.4vw,46px)] font-black tracking-[-0.04em] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
        />
        <fieldset className="mt-8">
          <legend className="eyebrow">Pick a thread</legend>
          <div className="mt-3 flex gap-3">
            {THREADS.map((th, i) => (
              <button
                key={th.name}
                type="button"
                onClick={() => setThread(i)}
                aria-pressed={thread === i}
                aria-label={th.name}
                className={cn("h-11 w-11 rounded-full border-2 transition-transform duration-500 ease-lab hover:scale-110", thread === i ? "scale-110 border-ink" : "border-transparent")}
                style={{ background: th.body, boxShadow: "inset 0 0 0 3px hsl(var(--paper))" }}
              />
            ))}
          </div>
        </fieldset>
        <a href={mail} className="btn btn-orange mt-10">
          Send it to the studio <span className="arrow" aria-hidden="true">→</span>
        </a>
        <p className="mt-4 text-[13.5px] text-ink-soft">Opens an email to Aldo with your product name in the subject.</p>
      </div>
    </div>
  );
}
