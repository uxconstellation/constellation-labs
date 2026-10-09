import { useId } from "react";

/**
 * The Labs mark: the Constellation capsule as a glass test tube, the Constellation
 * star suspended inside, orange "experiment" liquid, and a satin ring that passes
 * behind and in front of the glass on the diagonal.
 *
 * variant="color"  full mark, for white and light surfaces
 * variant="mono"   one colour, inherits currentColor (use on dark or for print)
 * variant="small"  simplified for 16 to 48px (favicon, header on mobile)
 */
type Variant = "color" | "mono" | "small";

const TUBE = "M140 70 L140 290 A60 60 0 0 0 260 290 L260 70 Z";
const STAR =
  "M3211.7 1706.5C2940.86 1435.66 2835.54 1435.66 2564.7 1706.5C2835.54 1435.66 2835.54 1330.34 2564.7 1059.5C2835.54 1330.34 2940.86 1330.34 3211.7 1059.5C2940.86 1330.34 2940.86 1435.66 3211.7 1706.5Z";
const STAR_T = "translate(196 188) scale(.15) translate(-2888.2 -1383)";
const RING_T = "rotate(20 200 200)";

export default function LabsMark({
  variant = "color",
  className,
  title = "Constellation Labs",
}: {
  variant?: Variant;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const u = (n: string) => `${n}-${id}`;
  const ref = (n: string) => `url(#${u(n)})`;

  const sharedDefs = (
    <>
      <clipPath id={u("tube")}><path d={TUBE} /></clipPath>
      <clipPath id={u("back")}><rect width="400" height="200" /></clipPath>
      <clipPath id={u("front")}><rect y="200" width="400" height="200" /></clipPath>
    </>
  );

  if (variant === "small") {
    return (
      <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title}>
        <defs>{sharedDefs}</defs>
        <g transform="rotate(45 200 200)">
          <path d={TUBE} fill="#fff" />
          <rect x="130" y="270" width="140" height="90" fill="#FE6E36" clipPath={ref("tube")} />
          <path d={TUBE} fill="none" stroke="#173F3F" strokeWidth="18" />
          <rect x="116" y="48" width="168" height="24" rx="12" fill="#173F3F" />
        </g>
        <path d={STAR} fill="#173F3F" transform="translate(196 186) scale(.2) translate(-2888.2 -1383)" />
      </svg>
    );
  }

  if (variant === "mono") {
    return (
      <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title} fill="currentColor">
        <defs>{sharedDefs}</defs>
        <g transform={RING_T}><g clipPath={ref("back")}><ellipse cx="200" cy="200" rx="176" ry="44" fill="none" stroke="currentColor" strokeWidth="12" opacity=".35" /></g></g>
        <g transform="rotate(45 200 200)">
          <path d={TUBE} fill="none" stroke="currentColor" strokeWidth="12" />
          <rect x="124" y="54" width="152" height="18" rx="9" />
          <rect x="130" y="282" width="140" height="80" clipPath={ref("tube")} />
        </g>
        <path d={STAR} transform={STAR_T} />
        <g transform={RING_T}><g clipPath={ref("front")}><ellipse cx="200" cy="200" rx="176" ry="44" fill="none" stroke="currentColor" strokeWidth="12" /></g></g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title}>
      <defs>
        {sharedDefs}
        <linearGradient id={u("glass")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".18" stopColor="#EEF2F1" stopOpacity=".55" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".85" stopColor="#E6ECEA" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={u("edge")} x1="0" x2="1">
          <stop offset="0" stopColor="#173F3F" stopOpacity=".45" />
          <stop offset=".5" stopColor="#173F3F" stopOpacity=".12" />
          <stop offset="1" stopColor="#173F3F" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id={u("liquid")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FF8A57" />
          <stop offset="1" stopColor="#F45A1F" />
        </linearGradient>
        <linearGradient id={u("satin")} x1="0" x2="1">
          <stop offset="0" stopColor="#C9BCA4" />
          <stop offset=".22" stopColor="#FBF8F3" />
          <stop offset=".42" stopColor="#D8CCB6" />
          <stop offset=".6" stopColor="#fff" />
          <stop offset=".8" stopColor="#C2B49B" />
          <stop offset="1" stopColor="#EDE5D8" />
        </linearGradient>
        <linearGradient id={u("satinBack")} x1="0" x2="1">
          <stop offset="0" stopColor="#B7AA93" />
          <stop offset=".5" stopColor="#D9CFBE" />
          <stop offset="1" stopColor="#B7AA93" />
        </linearGradient>
      </defs>

      <g transform={RING_T}><g clipPath={ref("back")}>
        <ellipse cx="200" cy="200" rx="176" ry="44" fill="none" stroke={ref("satinBack")} strokeWidth="13" opacity=".75" />
      </g></g>

      <g transform="rotate(45 200 200)">
        <g clipPath={ref("tube")}>
          <rect x="130" y="60" width="140" height="300" fill={ref("glass")} />
          <rect x="130" y="280" width="140" height="80" fill={ref("liquid")} />
          <ellipse cx="200" cy="280" rx="62" ry="6" fill="#FFB08C" />
          <circle cx="178" cy="312" r="5" fill="#fff" opacity=".55" />
          <circle cx="214" cy="298" r="3.2" fill="#fff" opacity=".5" />
          <circle cx="196" cy="334" r="2.6" fill="#fff" opacity=".45" />
          <rect x="156" y="92" width="12" height="210" rx="6" fill="#fff" opacity=".85" />
        </g>
        <path d={TUBE} fill="none" stroke={ref("edge")} strokeWidth="3" />
        <rect x="128" y="56" width="144" height="16" rx="8" fill="#fff" stroke={ref("edge")} strokeWidth="3" />
      </g>

      <path d={STAR} fill="#173F3F" transform={STAR_T} />

      <g transform={RING_T}><g clipPath={ref("front")}>
        <ellipse cx="200" cy="200" rx="176" ry="44" fill="none" stroke={ref("satin")} strokeWidth="15" />
        <ellipse cx="200" cy="196" rx="176" ry="44" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
      </g></g>
    </svg>
  );
}
