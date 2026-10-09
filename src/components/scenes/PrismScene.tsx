import Scene, { PAPER, Check, CREAM, FONT, GREEN, INK, LINE, MIST, Shadow, TEAL, type Beat, type ScenePieceProps } from "./Scene";

const beats: Beat[] = [
  { at: 0.3, label: "A site built with AI" },
  { at: 1.6, label: "Add Prism" },
  { at: 3.8, label: "Click and edit the words" },
  { at: 5.8, label: "Swap images, move sections" },
  { at: 8.6, label: "Publish. Code untouched." },
];

const SPECTRUM = ["#FE6E36", "#F2B33D", TEAL, "#7C8CF0", "#C77DDB"];
const OUT = { x: 232, y: 330 };
const TARGETS = [
  { x: 322, y: 160 }, // headline
  { x: 556, y: 172 }, // image
  { x: 320, y: 306 }, // section A
  { x: 320, y: 407 }, // section B
  { x: 650, y: 89 }, // publish
];

function build(tl: gsap.core.Timeline) {
  tl.set(".pr-all", { opacity: 1 }, 0)
    .set(".pr-window", { opacity: 0, y: 26, scale: 0.97, transformOrigin: "50% 50%" }, 0)
    .set(".pr-bit", { opacity: 0, y: 10 }, 0)
    .set(".pr-prism", { opacity: 0, scale: 0.6, rotation: -12, transformOrigin: "50% 60%" }, 0)
    .set(".pr-glow", { opacity: 0 }, 0)
    .set([".pr-beam", ".pr-ray"], { strokeDashoffset: 1, opacity: 1 }, 0)
    .set(".pr-sel", { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" }, 0)
    .set(".pr-cursor", { x: 720, y: 560, opacity: 0, scale: 1 }, 0)
    .set(".pr-h-old", { opacity: 1 }, 0)
    .set(".pr-new-rect", { attr: { width: 0 } }, 0)
    .set(".pr-caret", { opacity: 0, attr: { x: 330 } }, 0)
    .set(".pr-img-b", { opacity: 0 }, 0)
    .set(".pr-secA", { y: 0 }, 0)
    .set(".pr-secB", { y: 0, scale: 1, transformOrigin: "50% 50%" }, 0)
    .set(".pr-pub-bg", { fill: INK }, 0)
    .set(".pr-pub-t", { opacity: 1 }, 0)
    .set(".pr-pub-ok", { opacity: 0 }, 0)
    .set(".pr-code", { opacity: 0, y: 10 }, 0)
    .set(".pr-lock", { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, 0);

  // 01 The site
  tl.to(".pr-window", { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 0.1)
    .to(".pr-bit", { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 }, 0.4)
    .to(".pr-code", { opacity: 1, y: 0, duration: 0.5 }, 0.9);

  // 02 Prism splits the light into editing handles
  tl.to(".pr-prism", { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.8)" }, 1.6)
    .to(".pr-beam", { strokeDashoffset: 0, duration: 0.5, ease: "power2.in" }, 2.0)
    .to(".pr-glow", { opacity: 1, duration: 0.3 }, 2.45)
    .to(".pr-ray", { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }, 2.5)
    .to(".pr-sel", { opacity: 1, scale: 1, duration: 0.35, stagger: 0.08, ease: "back.out(2)" }, 3.05);

  // 03 Edit the headline
  tl.to(".pr-ray", { opacity: 0.25, duration: 0.4 }, 3.8)
    .to(".pr-cursor", { opacity: 1, duration: 0.2 }, 3.8)
    .to(".pr-cursor", { x: 470, y: 176, duration: 0.7, ease: "power2.inOut" }, 3.8)
    .to(".pr-cursor", { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }, 4.5)
    .to(".pr-h-old", { opacity: 0, duration: 0.25 }, 4.65)
    .to(".pr-caret", { opacity: 1, duration: 0.05 }, 4.65)
    .to(".pr-new-rect", { attr: { width: 230 }, duration: 0.95, ease: "steps(18)" }, 4.75)
    .to(".pr-caret", { attr: { x: 496 }, duration: 0.95, ease: "steps(18)" }, 4.75)
    .to(".pr-caret", { opacity: 0, duration: 0.05 }, 5.75);

  // 04 Swap the image, drag a section up
  tl.to(".pr-ray", { opacity: 0, duration: 0.4 }, 5.8)
    .to(".pr-cursor", { x: 660, y: 196, duration: 0.6, ease: "power2.inOut" }, 5.8)
    .to(".pr-cursor", { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }, 6.4)
    .to(".pr-img-b", { opacity: 1, duration: 0.5 }, 6.5)
    .to(".pr-cursor", { x: 600, y: 410, duration: 0.6, ease: "power2.inOut" }, 7.0)
    .to(".pr-secB", { scale: 1.03, duration: 0.25 }, 7.6)
    .to(".pr-secB", { y: -116, duration: 0.75, ease: "power3.inOut" }, 7.8)
    .to(".pr-cursor", { y: 294, duration: 0.75, ease: "power3.inOut" }, 7.8)
    .to(".pr-secA", { y: 86, duration: 0.75, ease: "power3.inOut" }, 7.85)
    .to(".pr-secB", { scale: 1, duration: 0.25 }, 8.55);

  // 05 Publish, code stays locked
  tl.to(".pr-cursor", { x: 712, y: 98, duration: 0.6, ease: "power2.inOut" }, 8.6)
    .to(".pr-cursor", { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }, 9.2)
    .to(".pr-sel", { opacity: 0, duration: 0.3 }, 9.3)
    .to(".pr-pub-bg", { fill: GREEN, duration: 0.3 }, 9.3)
    .to(".pr-pub-t", { opacity: 0, duration: 0.15 }, 9.3)
    .to(".pr-pub-ok", { opacity: 1, duration: 0.2 }, 9.4)
    .to(".pr-cursor", { opacity: 0, duration: 0.3 }, 9.8)
    .to(".pr-lock", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, 9.7)
    .addLabel("hold", 10.6)
    .to(".pr-all", { opacity: 0, duration: 0.6 }, 11.8);
}

export default function PrismScene({ showBeats, active, onBeat }: ScenePieceProps) {
  return (
    <Scene title="Prism" beats={beats} build={build} showBeats={showBeats} active={active} onBeat={onBeat}>
      <svg viewBox="0 0 800 600" fontFamily={FONT}>
        <defs>
          <Shadow id="pr-sh" />
          <Shadow id="pr-sh-sm" y={8} blur={8} opacity={0.2} />
          <clipPath id="pr-new"><rect className="pr-new-rect" x="330" y="128" width="0" height="72" /></clipPath>
          <clipPath id="pr-imgclip"><rect x="560" y="112" width="176" height="120" rx="10" /></clipPath>
          <linearGradient id="pr-face" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff" stopOpacity=".55" />
          </linearGradient>
          <radialGradient id="pr-glowg"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>

        <g className="pr-all">
          {/* Site window */}
          <g className="pr-window">
            <g filter="url(#pr-sh)"><rect x="300" y="64" width="460" height="470" rx="16" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <path d="M300 80a16 16 0 0 1 16-16h428a16 16 0 0 1 16 16v20H300z" fill={CREAM} />
            <circle cx="320" cy="82" r="4.5" fill="#D9CFC2" /><circle cx="334" cy="82" r="4.5" fill="#D9CFC2" /><circle cx="348" cy="82" r="4.5" fill="#D9CFC2" />
            <rect className="pr-pub-bg" x="650" y="72" width="96" height="22" rx="11" fill={INK} />
            <text className="pr-pub-t" x="698" y="87" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">Publish</text>
            <g className="pr-pub-ok"><Check x={676} y={83} s={0.6} /><text x="686" y="87" fontSize="11" fontWeight="700" fill="#fff">Published</text></g>

            <g className="pr-bit">
              <g className="pr-h-old" fontSize="30" fontWeight="900" fill={INK} letterSpacing="-1">
                <text x="330" y="152">Fresh bread,</text><text x="330" y="186">baked daily.</text>
              </g>
              <g clipPath="url(#pr-new)" fontSize="30" fontWeight="900" fill={INK} letterSpacing="-1">
                <text x="330" y="152">Sourdough,</text><text x="330" y="186">at sunrise.</text>
              </g>
              <rect className="pr-caret" x="498" y="164" width="2.5" height="28" fill="#7C8CF0" />
            </g>
            <g className="pr-bit">
              <rect x="330" y="204" width="180" height="7" rx="3.5" fill={LINE} />
              <rect x="330" y="218" width="140" height="7" rx="3.5" fill={LINE} />
            </g>
            <g className="pr-bit" clipPath="url(#pr-imgclip)">
              <rect x="560" y="112" width="176" height="120" fill="#F2D6B0" />
              <ellipse cx="648" cy="186" rx="52" ry="26" fill="#C8753A" />
              <path d="M616 178 q8 -10 16 0 M640 172 q8 -10 16 0 M664 178 q8 -10 16 0" fill="none" stroke="#F2D6B0" strokeWidth="4" strokeLinecap="round" />
              <g className="pr-img-b">
                <rect x="560" y="112" width="176" height="120" fill="#C9C3EE" />
                <circle cx="648" cy="196" r="34" fill="#F2B33D" />
                <path d="M560 206 H736 V232 H560Z" fill="#7C8CF0" />
              </g>
            </g>

            <g className="pr-secA">
              <g className="pr-bit">
                <rect x="324" y="256" width="412" height="100" rx="10" fill={MIST} />
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <rect x={340 + i * 132} y="272" width="116" height="40" rx="6" fill={LINE} />
                    <rect x={340 + i * 132} y="322" width="90" height="7" rx="3.5" fill={LINE} />
                    <rect x={340 + i * 132} y="336" width="64" height="7" rx="3.5" fill={LINE} />
                  </g>
                ))}
              </g>
              <rect className="pr-sel" x="319" y="251" width="422" height="110" rx="12" fill="none" stroke={SPECTRUM[2]} strokeWidth="2" strokeDasharray="6 5" />
            </g>
            <g className="pr-secB">
              <g className="pr-bit">
                <rect x="324" y="372" width="412" height="70" rx="10" fill={TEAL} />
                <text x="344" y="404" fontSize="22" fontWeight="900" fill={TEAL}>"</text>
                <rect x="362" y="392" width="220" height="7" rx="3.5" fill={CREAM} opacity=".55" />
                <rect x="362" y="408" width="160" height="7" rx="3.5" fill={CREAM} opacity=".55" />
              </g>
              <rect className="pr-sel" x="319" y="367" width="422" height="80" rx="12" fill="none" stroke={SPECTRUM[3]} strokeWidth="2" strokeDasharray="6 5" />
            </g>
            <g className="pr-bit">
              <rect x="324" y="462" width="412" height="1" fill={LINE} />
              <rect x="324" y="482" width="90" height="7" rx="3.5" fill={LINE} />
              <rect x="650" y="482" width="86" height="7" rx="3.5" fill={LINE} />
            </g>

            <rect className="pr-sel" x="322" y="122" width="200" height="74" rx="10" fill="none" stroke={SPECTRUM[0]} strokeWidth="2" strokeDasharray="6 5" />
            <rect className="pr-sel" x="555" y="107" width="186" height="130" rx="12" fill="none" stroke={SPECTRUM[1]} strokeWidth="2" strokeDasharray="6 5" />
          </g>

          {/* Code chip */}
          <g className="pr-code">
            <g filter="url(#pr-sh-sm)"><rect x="40" y="470" width="210" height="44" rx="22" fill={INK} /></g>
            <text x="62" y="497" fontSize="13" fontWeight="700" fill="#fff">{"</>"}</text>
            <text x="92" y="497" fontSize="12.5" fontWeight="500" fill={CREAM}>Your code</text>
            <g className="pr-lock">
              <circle cx="226" cy="492" r="12" fill={GREEN} />
              <rect x="220" y="490" width="12" height="9" rx="2" fill="#fff" />
              <path d="M222.5 490 v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none" stroke="#fff" strokeWidth="1.8" />
            </g>
            <text className="pr-lock" x="40" y="540" fontSize="11.5" fontWeight="700" fill={INK}>Untouched. Only content changed.</text>
          </g>

          {/* Light, prism, rays */}
          <path className="pr-beam" d="M0 352 L152 332" pathLength={1} strokeDasharray="1" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
          {TARGETS.map((t, i) => (
            <path key={i} className="pr-ray" d={`M${OUT.x} ${OUT.y} Q${(OUT.x + t.x) / 2 + 10} ${(OUT.y + t.y) / 2 + 30} ${t.x} ${t.y}`} pathLength={1} strokeDasharray="1" stroke={SPECTRUM[i]} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          ))}
          <circle className="pr-glow" cx="190" cy="335" r="70" fill="url(#pr-glowg)" />
          <g className="pr-prism" filter="url(#pr-sh-sm)">
            <path d="M190 254 L270 398 H110Z" fill="url(#pr-face)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M190 254 L206 398 H270Z" fill="#7C8CF0" fillOpacity=".18" />
            <path d="M152 332 L232 330" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
          </g>

          {/* Cursor */}
          <g className="pr-cursor">
            <path d="M0 0 L0 22 L6 16.5 L10.5 26 L14.5 24 L10 15 L18 15Z" fill={INK} stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </Scene>
  );
}
