import type { ReactNode } from "react";
import type { ProductSlug } from "@/content/products";

/**
 * Embroidered product patches. Each one is its own shape and illustration.
 * `sheen` (viewBox units) draws the moving thread highlight, clipped to the patch.
 * Requires <PatchDefs /> once on the page.
 */

const EMB = "url(#pt-emb)";
const LIFT = "url(#pt-lift)";
const SATIN = "url(#pt-satin)";
const SATIN2 = "url(#pt-satin2)";
const TWILL = "url(#pt-twill)";
const NAME_FONT = "'Noken','Arial Black',sans-serif";

type Sheen = { x: number; y: number } | null;

function SheenLayer({ clip, sheen }: { clip: string; sheen: Sheen }) {
  if (!sheen) return null;
  return (
    <g clipPath={clip} style={{ mixBlendMode: "soft-light" }} pointerEvents="none">
      <circle cx={sheen.x} cy={sheen.y} r="170" fill="url(#pt-sheen)" />
    </g>
  );
}

function Acre({ sheen }: { sheen: Sheen }) {
  return (
    <>
      <defs>
        <clipPath id="pt-acre-in"><circle cx="200" cy="200" r="150" /></clipPath>
        <clipPath id="pt-acre-out"><circle cx="200" cy="200" r="172" /></clipPath>
      </defs>
      <g filter={LIFT}>
        <circle cx="200" cy="200" r="172" fill="#2F6B4F" />
        <circle cx="200" cy="200" r="172" fill="none" stroke="#24563F" strokeWidth="16" strokeDasharray="1.6 2.6" />
        <circle cx="200" cy="200" r="158" fill="#FBF7F1" />
        <circle cx="200" cy="200" r="158" fill={TWILL} />
      </g>
      <g clipPath="url(#pt-acre-in)" filter={EMB}>
        <g data-detail="sun">
          <circle cx="282" cy="118" r="30" fill="#F7A27A" /><circle cx="282" cy="118" r="30" fill={SATIN} />
        </g>
        <path d="M40 252 Q130 170 240 222 T380 210 V380 H40 Z" fill="#4E9673" />
        <path d="M40 252 Q130 170 240 222 T380 210 V380 H40 Z" fill={SATIN2} />
        <path d="M30 278 Q190 218 380 268 V380 H30 Z" fill="#2F6B4F" />
        <path d="M30 278 Q190 218 380 268 V380 H30 Z" fill={SATIN} />
        <rect x="148" y="186" width="84" height="56" fill="#FFFFFF" />
        <rect x="148" y="186" width="84" height="56" fill={SATIN2} />
        <path d="M136 190 L190 146 L244 190 Z" fill="#FE6E36" />
        <path d="M136 190 L190 146 L244 190 Z" fill={SATIN} />
        <rect x="181" y="208" width="18" height="34" rx="2" fill="#173F3F" />
        <rect x="158" y="200" width="16" height="14" fill="#B8D8CB" />
        <rect x="206" y="200" width="16" height="14" fill="#B8D8CB" />
        <path d="M96 262 V238" stroke="#7A5A3A" strokeWidth="6" strokeLinecap="round" />
        <circle cx="96" cy="222" r="22" fill="#173F3F" /><circle cx="96" cy="222" r="22" fill={SATIN} />
        <circle cx="300" cy="236" r="13" fill="#173F3F" />
        <path d="M300 249 V262" stroke="#7A5A3A" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="200" cy="200" r="146" fill="none" stroke="#2F6B4F" strokeWidth="2.4" strokeDasharray="7 6" opacity=".7" />
      <SheenLayer clip="url(#pt-acre-out)" sheen={sheen} />
      <g filter={LIFT}>
        <path d="M70 330 L330 330 L346 352 L330 374 L70 374 L54 352 Z" fill="#173F3F" />
        <path d="M74 336 L326 336 M74 368 L326 368" stroke="#FBF7F1" strokeWidth="1.8" strokeDasharray="6 5" opacity=".55" />
      </g>
      <text x="200" y="362" textAnchor="middle" fontFamily={NAME_FONT} fontWeight="900" fontSize="30" letterSpacing="6" fill="#FBF7F1" filter={EMB}>ACRE</text>
    </>
  );
}

const PIN_OUT = "M200 408 C146 338 46 276 46 176 A154 154 0 1 1 354 176 C354 276 254 338 200 408 Z";
const PIN_IN = "M200 392 C150 326 62 268 62 176 A138 138 0 1 1 338 176 C338 268 250 326 200 392 Z";

function Pinpoints({ sheen }: { sheen: Sheen }) {
  return (
    <>
      <defs>
        <clipPath id="pt-pin-in"><path d={PIN_IN} /></clipPath>
        <clipPath id="pt-pin-out"><path d={PIN_OUT} /></clipPath>
      </defs>
      <g filter={LIFT}>
        <path d={PIN_OUT} fill="#C2410C" />
        <path d={PIN_OUT} fill="none" stroke="#A3360A" strokeWidth="16" strokeDasharray="1.6 2.6" />
        <path d={PIN_IN} fill="#FE6E36" />
        <path d={PIN_IN} fill={TWILL} />
      </g>
      <g clipPath="url(#pt-pin-in)" filter={EMB}>
        <rect x="104" y="82" width="192" height="146" rx="14" fill="#FBF7F1" />
        <rect x="104" y="82" width="192" height="146" rx="14" fill={SATIN2} />
        <rect x="104" y="82" width="192" height="26" rx="14" fill="#E8E2D8" />
        <circle cx="122" cy="95" r="4.5" fill="#FE6E36" />
        <circle cx="137" cy="95" r="4.5" fill="#B7AA93" />
        <circle cx="152" cy="95" r="4.5" fill="#B7AA93" />
        <rect x="122" y="124" width="112" height="14" rx="4" fill="#160C15" />
        <rect x="122" y="150" width="150" height="7" rx="3.5" fill="#B7AA93" />
        <rect x="122" y="164" width="130" height="7" rx="3.5" fill="#B7AA93" />
        <rect x="122" y="190" width="70" height="22" rx="11" fill="#173F3F" />
        <rect x="116" y="118" width="124" height="26" rx="6" fill="none" stroke="#173F3F" strokeWidth="3" strokeDasharray="6 4" />
        <g data-detail="pin">
          <path d="M246 126 L238 152" stroke="#160C15" strokeWidth="4" strokeLinecap="round" />
          <circle cx="249" cy="118" r="15" fill="#173F3F" /><circle cx="249" cy="118" r="15" fill={SATIN} />
          <circle cx="244" cy="113" r="4.5" fill="#B8D8CB" />
        </g>
        <g transform="translate(-8 -34)" data-detail="comment">
          <path d="M250 214 h86 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-58 l-14 14 v-14 h-14 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 z" fill="#FFFFFF" />
          <circle cx="276" cy="243" r="13" fill="#2F6B4F" />
          <path d="M269 243 l5 5 l9 -10" fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="296" y="234" width="38" height="6" rx="3" fill="#B7AA93" />
          <rect x="296" y="246" width="26" height="6" rx="3" fill="#B7AA93" />
        </g>
      </g>
      <path d="M200 380 C154 318 74 262 74 176 A126 126 0 1 1 326 176 C326 262 246 318 200 380 Z" fill="none" stroke="#FBF7F1" strokeWidth="2.4" strokeDasharray="7 6" opacity=".55" />
      <SheenLayer clip="url(#pt-pin-out)" sheen={sheen} />
      <text x="200" y="304" textAnchor="middle" fontFamily={NAME_FONT} fontWeight="900" fontSize="24" letterSpacing="3" fill="#FBF7F1" filter={EMB}>PINPOINTS</text>
    </>
  );
}

function Prism({ sheen }: { sheen: Sheen }) {
  return (
    <>
      <defs>
        <clipPath id="pt-prism-in"><path d="M200 64 L350 330 L50 330 Z" /></clipPath>
        <clipPath id="pt-prism-out"><path d="M200 26 L384 356 L16 356 Z" /></clipPath>
      </defs>
      <g filter={LIFT}>
        <path d="M200 44 L366 340 L34 340 Z" fill="#2D2F38" stroke="#2D2F38" strokeWidth="34" strokeLinejoin="round" />
        <path d="M200 44 L366 340 L34 340 Z" fill="none" stroke="#3A3C46" strokeWidth="18" strokeLinejoin="round" strokeDasharray="1.6 2.6" />
        <path d="M200 64 L350 330 L50 330 Z" fill="#160C15" stroke="#160C15" strokeWidth="18" strokeLinejoin="round" />
        <path d="M200 64 L350 330 L50 330 Z" fill={TWILL} />
      </g>
      <g clipPath="url(#pt-prism-in)" filter={EMB}>
        <g transform="translate(200 214) scale(1.3) translate(-200 -214)">
          <path d="M40 252 L176 206" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
          <g data-detail="spectrum">
            <path d="M222 214 L380 200 L380 226 Z" fill="#FE6E36" />
            <path d="M222 216 L380 226 L380 252 Z" fill="#F2B33D" />
            <path d="M222 218 L380 252 L380 278 Z" fill="#7FC8A9" />
            <path d="M222 220 L380 278 L380 304 Z" fill="#7C8CF0" />
            <path d="M222 222 L380 304 L380 330 Z" fill="#C77DDB" />
          </g>
          <path d="M200 156 L246 238 L154 238 Z" fill="#E9F1EF" opacity=".92" />
          <path d="M200 156 L246 238 L154 238 Z" fill={SATIN} />
          <path d="M200 156 L222 238" stroke="#FFFFFF" strokeWidth="2" opacity=".8" />
          <path d="M200 156 L246 238 L154 238 Z" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
        </g>
      </g>
      <path d="M200 88 L330 318 L70 318 Z" fill="none" stroke="#B7AA93" strokeWidth="2.4" strokeLinejoin="round" strokeDasharray="7 6" opacity=".6" />
      <SheenLayer clip="url(#pt-prism-out)" sheen={sheen} />
      <text x="200" y="312" textAnchor="middle" fontFamily={NAME_FONT} fontWeight="900" fontSize="26" letterSpacing="6" fill="#FBF7F1" filter={EMB}>PRISM</text>
    </>
  );
}

function Nod({ sheen }: { sheen: Sheen }) {
  return (
    <>
      <defs>
        <clipPath id="pt-nod-in"><rect x="54" y="74" width="292" height="252" rx="58" /></clipPath>
        <clipPath id="pt-nod-out"><rect x="38" y="58" width="324" height="284" rx="72" /></clipPath>
      </defs>
      <g filter={LIFT}>
        <rect x="38" y="58" width="324" height="284" rx="72" fill="#C8753A" />
        <rect x="38" y="58" width="324" height="284" rx="72" fill="none" stroke="#A85E2A" strokeWidth="16" strokeDasharray="1.6 2.6" />
        <rect x="54" y="74" width="292" height="252" rx="58" fill="#F8F6F2" />
        <rect x="54" y="74" width="292" height="252" rx="58" fill={TWILL} />
      </g>
      <g clipPath="url(#pt-nod-in)" filter={EMB}>
        <path d="M40 262 H360 V340 H40 Z" fill="#E8D5C2" />
        <path d="M40 262 H360" stroke="#C8753A" strokeWidth="6" />
        <g data-detail="qr">
          <path d="M184 262 L194 206 H206 L216 262 Z" fill="#FFFFFF" />
          <rect x="191" y="214" width="18" height="18" fill="#160C15" />
          <rect x="194" y="217" width="5" height="5" fill="#FFFFFF" />
          <rect x="201" y="224" width="5" height="5" fill="#FFFFFF" />
        </g>
        <path d="M104 214 H164 L158 262 H110 Z" fill="#C8753A" /><path d="M104 214 H164 L158 262 H110 Z" fill={SATIN} />
        <path d="M164 224 a12 12 0 0 1 0 22" fill="none" stroke="#C8753A" strokeWidth="7" />
        <path d="M296 214 H236 L242 262 H290 Z" fill="#52B788" /><path d="M296 214 H236 L242 262 H290 Z" fill={SATIN} />
        <path d="M236 224 a12 12 0 0 0 0 22" fill="none" stroke="#52B788" strokeWidth="7" />
        <path className="patch-steam" d="M134 200 C126 178 146 166 140 146 C136 132 150 120 168 116" fill="none" stroke="#B7AA93" strokeWidth="6" strokeLinecap="round" />
        <path className="patch-steam" d="M266 200 C274 178 254 166 260 146 C264 132 250 120 232 116" fill="none" stroke="#B7AA93" strokeWidth="6" strokeLinecap="round" />
        <g data-detail="nod">
          <circle cx="200" cy="112" r="19" fill="#C8753A" />
          <path d="M190 112 l7 7 l13 -14" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <rect x="66" y="86" width="268" height="228" rx="48" fill="none" stroke="#C8753A" strokeWidth="2.4" strokeDasharray="7 6" opacity=".6" />
      <SheenLayer clip="url(#pt-nod-out)" sheen={sheen} />
      <g filter={LIFT}><rect x="140" y="320" width="120" height="44" rx="22" fill="#160C15" /></g>
      <text x="200" y="351" textAnchor="middle" fontFamily={NAME_FONT} fontWeight="900" fontSize="26" letterSpacing="6" fill="#F8F6F2" filter={EMB}>NOD</text>
    </>
  );
}

const ART: Record<ProductSlug, (p: { sheen: Sheen }) => ReactNode> = { acre: Acre, pinpoints: Pinpoints, prism: Prism, nod: Nod };

export default function Patch({ slug, sheen = null, className, title }: { slug: ProductSlug; sheen?: Sheen; className?: string; title?: string }) {
  const Art = ART[slug];
  return (
    <svg viewBox="0 0 400 420" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} overflow="visible">
      <Art sheen={sheen} />
    </svg>
  );
}
