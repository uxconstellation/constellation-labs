import Scene, { PAPER, Check, CREAM, FONT, GREEN, INK, LINE, MIST, ORANGE, SAND, Shadow, SOFT, TEAL, type Beat, type ScenePieceProps } from "./Scene";

const beats: Beat[] = [
  { at: 1.2, label: "Drop a pin" },
  { at: 2.4, label: "Say what needs to change" },
  { at: 4.4, label: "Edit it right on the page" },
  { at: 8.2, label: "Approve the suggestion" },
  { at: 10.6, label: "Sites, PDFs, video, images" },
];

function build(tl: gsap.core.Timeline) {
  tl.set(".pp-all", { opacity: 1 }, 0)
    .set(".pp-window", { opacity: 0, y: 30, scale: 0.97, transformOrigin: "50% 50%" }, 0)
    .set(".pp-bit", { opacity: 0, y: 10 }, 0)
    .set(".pp-pin-drop", { y: -280, opacity: 0 }, 0)
    .set(".pp-pin-body", { fill: ORANGE }, 0)
    .set(".pp-pin-shadow", { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" }, 0)
    .set(".pp-ring", { opacity: 0 }, 0)
    .set(".pp-comment", { opacity: 0, y: 12, scale: 0.92, transformOrigin: "0% 100%" }, 0)
    .set(".pp-type-rect", { attr: { width: 0 } }, 0)
    .set(".pp-hl", { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" }, 0)
    .set(".pp-strike", { scaleX: 0, transformOrigin: "0% 50%" }, 0)
    .set(".pp-h-old", { opacity: 1 }, 0)
    .set(".pp-new-rect", { attr: { width: 0 } }, 0)
    .set(".pp-btn-bg", { fill: SAND }, 0)
    .set(".pp-swatch", { opacity: 0, scale: 0.6, transformOrigin: "0% 50%" }, 0)
    .set(".pp-sw-ring", { opacity: 0 }, 0)
    .set(".pp-img-b", { opacity: 0 }, 0)
    .set(".pp-card", { opacity: 0, y: 40 }, 0)
    .set(".pp-approve-bg", { fill: INK, scale: 1, transformOrigin: "50% 50%" }, 0)
    .set(".pp-approve-t", { opacity: 1 }, 0)
    .set(".pp-approved", { opacity: 0 }, 0)
    .set(".pp-code", { opacity: 0, x: -10 }, 0)
    .set(".pp-tabs", { opacity: 0, y: 10 }, 0)
    .set(".pp-tab-hi", { x: 0 }, 0);

  // Page loads
  tl.to(".pp-window", { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 0.1)
    .to(".pp-bit", { opacity: 1, y: 0, stagger: 0.06, duration: 0.6 }, 0.4);

  // 01 Pin drops
  tl.to(".pp-pin-drop", { opacity: 1, duration: 0.1 }, 1.2)
    .to(".pp-pin-drop", { y: 0, duration: 0.9, ease: "bounce.out" }, 1.2)
    .to(".pp-pin-shadow", { scale: 1, opacity: 0.3, duration: 0.9, ease: "bounce.out" }, 1.2)
    .fromTo(".pp-ring", { scale: 0.4, opacity: 0.9, transformOrigin: "50% 50%" }, { scale: 3.4, opacity: 0, duration: 1, ease: "power2.out" }, 1.75);

  // 02 Comment types itself
  tl.to(".pp-comment", { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 2.4)
    .to(".pp-type-rect", { attr: { width: 196 }, duration: 1.3, ease: "steps(22)" }, 2.9);

  // 03 Edit in place: headline, button colour, image
  tl.to(".pp-hl", { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 4.4)
    .to(".pp-strike", { scaleX: 1, duration: 0.4, stagger: 0.12, ease: "power2.inOut" }, 4.8)
    .to(".pp-h-old", { opacity: 0, duration: 0.3 }, 5.35)
    .to(".pp-new-rect", { attr: { width: 300 }, duration: 0.9, ease: "steps(16)" }, 5.45)
    .to(".pp-hl", { opacity: 0, duration: 0.4 }, 6.3)
    .to(".pp-swatch", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 6.2)
    .to(".pp-sw-ring", { opacity: 1, duration: 0.2 }, 6.7)
    .to(".pp-btn-bg", { fill: ORANGE, duration: 0.4 }, 6.8)
    .to(".pp-swatch", { opacity: 0, duration: 0.3 }, 7.5)
    .to(".pp-img-b", { opacity: 1, duration: 0.6 }, 7.3);

  // 04 Approve
  tl.to(".pp-comment", { opacity: 0, y: -6, duration: 0.3 }, 8.0)
    .to(".pp-card", { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)" }, 8.2)
    .to(".pp-approve-bg", { scale: 0.93, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }, 9.2)
    .to(".pp-approve-bg", { fill: GREEN, duration: 0.3 }, 9.35)
    .to(".pp-approve-t", { opacity: 0, duration: 0.15 }, 9.35)
    .to(".pp-approved", { opacity: 1, duration: 0.2 }, 9.45)
    .to(".pp-pin-body", { fill: GREEN, duration: 0.4 }, 9.5)
    .to(".pp-code", { opacity: 1, x: 0, duration: 0.5 }, 9.8);

  // 05 Works on any file
  tl.to(".pp-tabs", { opacity: 1, y: 0, duration: 0.5 }, 10.6)
    .to(".pp-tab-hi", { x: 104, duration: 0.35, ease: "power2.inOut" }, 11.3)
    .to(".pp-tab-hi", { x: 208, duration: 0.35, ease: "power2.inOut" }, 12.0)
    .to(".pp-tab-hi", { x: 312, duration: 0.35, ease: "power2.inOut" }, 12.7)
    .addLabel("hold", 13.4)
    .to(".pp-all", { opacity: 0, duration: 0.6 }, 14.6);
}

export default function PinpointsScene({ showBeats, active, onBeat }: ScenePieceProps) {
  return (
    <Scene title="Pinpoints" beats={beats} build={build} showBeats={showBeats} active={active} onBeat={onBeat}>
      <svg viewBox="0 0 800 600" fontFamily={FONT}>
        <defs>
          <Shadow id="pp-sh" />
          <Shadow id="pp-sh-sm" y={10} blur={10} opacity={0.18} />
          <clipPath id="pp-type"><rect className="pp-type-rect" x="436" y="128" width="0" height="22" /></clipPath>
          <clipPath id="pp-new"><rect className="pp-new-rect" x="118" y="164" width="0" height="80" /></clipPath>
          <clipPath id="pp-imgclip"><rect x="452" y="136" width="188" height="182" rx="10" /></clipPath>
        </defs>

        <g className="pp-all">
          {/* Browser */}
          <g className="pp-window">
            <g filter="url(#pp-sh)"><rect x="70" y="56" width="620" height="440" rx="18" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <path d="M70 74a18 18 0 0 1 18-18h584a18 18 0 0 1 18 18v22H70z" fill={CREAM} />
            <circle cx="94" cy="76" r="5" fill="#D9CFC2" /><circle cx="110" cy="76" r="5" fill="#D9CFC2" /><circle cx="126" cy="76" r="5" fill="#D9CFC2" />
            <rect x="150" y="66" width="150" height="20" rx="10" fill="#fff" />
            <text x="166" y="80" fontSize="11" fontWeight="500" fill={SOFT}>your-site.com</text>

            <rect x="94" y="112" width="572" height="230" rx="12" fill={TEAL} />
            <rect className="pp-hl" x="114" y="164" width="276" height="84" rx="6" fill={ORANGE} fillOpacity=".28" />
            <g className="pp-bit">
              <g className="pp-h-old" fontSize="34" fontWeight="900" fill={CREAM} letterSpacing="-1">
                <text x="122" y="198">Welcome to our</text>
                <text x="122" y="236">website.</text>
                <rect className="pp-strike" x="118" y="186" width="262" height="4" rx="2" fill={ORANGE} />
                <rect className="pp-strike" x="118" y="224" width="138" height="4" rx="2" fill={ORANGE} />
              </g>
              <g clipPath="url(#pp-new)" fontSize="34" fontWeight="900" fill={CREAM} letterSpacing="-1">
                <text x="122" y="198">Book a table</text>
                <text x="122" y="236">tonight.</text>
              </g>
            </g>
            <g className="pp-bit">
              <rect x="122" y="258" width="220" height="8" rx="4" fill={CREAM} opacity=".4" />
              <rect x="122" y="274" width="170" height="8" rx="4" fill={CREAM} opacity=".4" />
            </g>
            <g className="pp-bit">
              <rect className="pp-btn-bg" x="122" y="294" width="120" height="34" rx="17" fill={SAND} />
              <text x="182" y="316" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>Reserve</text>
            </g>
            <g className="pp-swatch">
              <rect x="252" y="298" width="86" height="26" rx="13" fill="#fff" />
              <circle cx="268" cy="311" r="7" fill={SAND} />
              <circle cx="295" cy="311" r="7" fill={ORANGE} />
              <circle className="pp-sw-ring" cx="295" cy="311" r="10.5" fill="none" stroke={INK} strokeWidth="1.5" />
              <circle cx="322" cy="311" r="7" fill={TEAL} />
            </g>

            {/* Image swaps */}
            <g className="pp-bit" clipPath="url(#pp-imgclip)">
              <rect x="452" y="136" width="188" height="182" fill="#B8D8CB" />
              <circle cx="546" cy="232" r="54" fill="#fff" />
              <circle cx="546" cy="232" r="36" fill={CREAM} />
              <path d="M520 226 q26 -26 52 0" fill="none" stroke={GREEN} strokeWidth="6" strokeLinecap="round" />
              <g className="pp-img-b">
                <rect x="452" y="136" width="188" height="182" fill="#F7A27A" />
                <circle cx="610" cy="166" r="16" fill="#FFE2C9" opacity=".8" />
                <path d="M486 232 h120 a60 52 0 0 1 -120 0z" fill={CREAM} />
                <path d="M486 232 h120" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                <path d="M520 214 q-10 -16 0 -30 M546 210 q-10 -16 0 -30 M572 214 q-10 -16 0 -30" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".9" />
                <rect x="452" y="296" width="188" height="22" fill="#C2410C" />
              </g>
            </g>

            {[94, 284, 474].map((x) => (
              <g className="pp-bit" key={x}>
                <rect x={x} y="362" width="180" height="110" rx="10" fill={MIST} />
                <rect x={x + 16} y="382" width="60" height="44" rx="6" fill={LINE} />
                <rect x={x + 16} y="438" width="120" height="7" rx="3.5" fill={LINE} />
                <rect x={x + 16} y="452" width="84" height="7" rx="3.5" fill={LINE} />
              </g>
            ))}
          </g>

          {/* Pin */}
          <ellipse className="pp-pin-shadow" cx="384" cy="200" rx="12" ry="4" fill={INK} />
          <circle className="pp-ring" cx="384" cy="198" r="10" fill="none" stroke={ORANGE} strokeWidth="3" />
          <g transform="translate(384 198)">
            <g className="pp-pin-drop" filter="url(#pp-sh-sm)">
              <path className="pp-pin-body" d="M0 0 C-6 -14 -22 -26 -22 -44 A22 22 0 1 1 22 -44 C22 -26 6 -14 0 0Z" fill={ORANGE} stroke="#fff" strokeWidth="2.5" />
              <circle cy="-44" r="9" fill="#fff" />
            </g>
          </g>

          {/* Comment */}
          <g className="pp-comment">
            <g filter="url(#pp-sh-sm)">
              <path d="M406 92 h236 a14 14 0 0 1 14 14 v42 a14 14 0 0 1 -14 14 h-218 l-14 12 v-12 a14 14 0 0 1 -18 -14 v-42 a14 14 0 0 1 14 -14z" fill={PAPER} stroke={LINE} strokeWidth="1" />
            </g>
            <circle cx="420" cy="127" r="13" fill="#F7A27A" />
            <text x="420" y="131.5" textAnchor="middle" fontSize="12" fontWeight="900" fill={INK}>C</text>
            <text x="440" y="117" fontSize="11" fontWeight="700" fill={INK}>Client <tspan fontWeight="500" fill={SOFT}>· on the headline</tspan></text>
            <g clipPath="url(#pp-type)">
              <text x="440" y="143" fontSize="14" fontWeight="500" fill={INK}>Can this feel warmer?</text>
            </g>
          </g>

          {/* Suggestion card */}
          <g className="pp-card">
            <g filter="url(#pp-sh)"><rect x="430" y="378" width="310" height="128" rx="16" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <text x="452" y="406" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>SUGGESTION</text>
            <text x="452" y="430" fontSize="17" fontWeight="900" fill={INK} letterSpacing="-.3">3 edits on this page</text>
            <text x="452" y="450" fontSize="12" fontWeight="500" fill={SOFT}>Headline · Button colour · Image</text>
            <rect className="pp-approve-bg" x="452" y="462" width="118" height="30" rx="15" fill={INK} />
            <text className="pp-approve-t" x="511" y="481.5" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">Approve</text>
            <g className="pp-approved">
              <Check x={490} y={477} s={0.9} />
              <text x="502" y="481.5" fontSize="12.5" fontWeight="700" fill="#fff">Approved</text>
            </g>
            <g className="pp-code">
              <rect x="580" y="462" width="142" height="30" rx="15" fill={CREAM} />
              <text x="651" y="481.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={INK}>{"</>"} <tspan fontWeight="500" fill={SOFT}>code untouched</tspan></text>
            </g>
          </g>

          {/* File types */}
          <g className="pp-tabs">
            <rect className="pp-tab-hi" x="190" y="522" width="96" height="34" rx="17" fill={INK} />
            {["Website", "PDF", "Video", "Image"].map((t, i) => (
              <g key={t}>
                <rect x={190 + i * 104} y="522" width="96" height="34" rx="17" fill="none" stroke={INK} strokeOpacity=".25" />
                <text x={238 + i * 104} y="543.5" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={INK}>{t}</text>
              </g>
            ))}
            <clipPath id="pp-tabclip"><rect className="pp-tab-hi" x="190" y="522" width="96" height="34" rx="17" /></clipPath>
            <g clipPath="url(#pp-tabclip)">
              {["Website", "PDF", "Video", "Image"].map((t, i) => (
                <text key={t} x={238 + i * 104} y="543.5" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">{t}</text>
              ))}
            </g>
          </g>
        </g>
      </svg>
    </Scene>
  );
}
