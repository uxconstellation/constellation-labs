import Scene, { PAPER, Check, CREAM, FONT, GREEN, INK, LINE, ORANGE, Shadow, SOFT, TEAL, type Beat, type ScenePieceProps } from "./Scene";

const beats: Beat[] = [
  { at: 0.3, label: "List the property" },
  { at: 1.8, label: "Everyone in one deal room" },
  { at: 3.4, label: "FICA and documents, done" },
  { at: 6.2, label: "Or rent it out" },
  { at: 8.4, label: "Bills, tracked" },
];

const ROWS = [
  { i: "TM", name: "Thandi M.", role: "Agent", c: ORANGE },
  { i: "PV", name: "Pieter V.", role: "Owner", c: GREEN },
  { i: "AN", name: "Aisha N.", role: "Buyer", c: "#8C7B5E" },
  { i: "LK", name: "Lerato K.", role: "Conveyancer", c: TEAL },
];
const STEPS = ["Listed", "Offer", "FICA", "Transfer", "Sold"];
const PANEL = { x: 476, y: 64, w: 268 };

function build(tl: gsap.core.Timeline) {
  tl.set(".pa-all", { opacity: 1 }, 0)
    .set([".pa-listing", ".pa-room", ".pa-docs", ".pa-bills"], { opacity: 0, y: 28 }, 0)
    .set(".pa-sky-bit", { opacity: 0, y: 14 }, 0)
    .set(".pa-house", { y: 40, opacity: 0 }, 0)
    .set(".pa-text", { opacity: 0, y: 8 }, 0)
    .set(".pa-tag-sale", { opacity: 1 }, 0)
    .set([".pa-tag-sold", ".pa-tag-let"], { opacity: 0 }, 0)
    .set(".pa-price-sale", { opacity: 1, y: 0 }, 0)
    .set(".pa-price-let", { opacity: 0, y: 10 }, 0)
    .set(".pa-row", { opacity: 0, x: 16 }, 0)
    .set(".pa-fica", { scale: 0, transformOrigin: "50% 50%" }, 0)
    .set(".pa-buyer", { opacity: 1 }, 0)
    .set(".pa-renter", { opacity: 0 }, 0)
    .set(".pa-pipe", { opacity: 1 }, 0)
    .set(".pa-progress", { scaleX: 0, transformOrigin: "0% 50%" }, 0)
    .set(".pa-step", { fill: "#fff", stroke: LINE }, 0)
    .set(".pa-stays", { opacity: 0, y: 10 }, 0)
    .set(".pa-stay", { scaleX: 0, transformOrigin: "0% 50%" }, 0)
    .set(".pa-doc", { opacity: 0, x: 20 }, 0)
    .set(".pa-paid", { scale: 0, transformOrigin: "50% 50%" }, 0)
    .set(".pa-bill", { opacity: 0, x: 14 }, 0);

  // 01 Listing appears
  tl.to(".pa-listing", { opacity: 1, y: 0, duration: 0.9 }, 0.05)
    .to(".pa-sky-bit", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.35)
    .to(".pa-house", { opacity: 1, y: 0, duration: 0.9, ease: "power4.out" }, 0.6)
    .to(".pa-text", { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.9);

  // 02 Deal room
  tl.to(".pa-room", { opacity: 1, y: 0, duration: 0.7 }, 1.8)
    .to(".pa-row", { opacity: 1, x: 0, duration: 0.45, stagger: 0.13 }, 2.1)
    .to(".pa-progress", { scaleX: 0.25, duration: 0.5, ease: "power2.inOut" }, 2.6)
    .to(".pa-step-1", { fill: INK, stroke: INK, duration: 0.2 }, 2.95);

  // 03 FICA on every party, documents in, sold
  tl.to(".pa-fica", { scale: 1, duration: 0.35, stagger: 0.14, ease: "back.out(2.6)" }, 3.4)
    .to(".pa-progress", { scaleX: 0.5, duration: 0.45, ease: "power2.inOut" }, 3.95)
    .to(".pa-step-2", { fill: INK, stroke: INK, duration: 0.2 }, 4.3)
    .to(".pa-docs", { opacity: 1, y: 0, duration: 0.6 }, 4.1)
    .to(".pa-doc", { opacity: 1, x: 0, duration: 0.45, stagger: 0.18 }, 4.3)
    .to(".pa-progress", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 4.7)
    .to(".pa-step-3", { fill: INK, stroke: INK, duration: 0.2 }, 5.05)
    .to(".pa-step-4", { fill: ORANGE, stroke: ORANGE, duration: 0.2 }, 5.45)
    .to(".pa-tag-sale", { opacity: 0, duration: 0.2 }, 5.5)
    .fromTo(".pa-tag-sold", { opacity: 0, scale: 1.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, 5.5);

  // 04 Rental
  tl.to(".pa-tag-sold", { opacity: 0, duration: 0.2 }, 6.2)
    .fromTo(".pa-tag-let", { opacity: 0, scale: 1.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, 6.25)
    .to(".pa-price-sale", { opacity: 0, y: -10, duration: 0.3 }, 6.3)
    .to(".pa-price-let", { opacity: 1, y: 0, duration: 0.4 }, 6.45)
    .to(".pa-buyer", { opacity: 0, duration: 0.25 }, 6.5)
    .to(".pa-renter", { opacity: 1, duration: 0.3 }, 6.7)
    .to(".pa-pipe", { opacity: 0, duration: 0.3 }, 6.6)
    .to(".pa-stays", { opacity: 1, y: 0, duration: 0.4 }, 6.9)
    .to(".pa-stay", { scaleX: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 7.15);

  // 05 Bills
  tl.to(".pa-docs", { opacity: 0, y: 16, duration: 0.35 }, 8.4)
    .to(".pa-bills", { opacity: 1, y: 0, duration: 0.6 }, 8.6)
    .to(".pa-bill", { opacity: 1, x: 0, duration: 0.4, stagger: 0.12 }, 8.8)
    .to(".pa-paid", { scale: 1, duration: 0.35, stagger: 0.3, ease: "back.out(2.6)" }, 9.3)
    .addLabel("hold", 10.6)
    .to(".pa-all", { opacity: 0, duration: 0.6 }, 11.8);
}

function Avatar({ x, y, c, i }: { x: number; y: number; c: string; i: string }) {
  return (
    <>
      <circle cx={x} cy={y} r="16" fill={c} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#fff" letterSpacing=".3">{i}</text>
    </>
  );
}

function House() {
  return (
    <g>
      {/* Outeniqua-style ridge */}
      <path className="pa-sky-bit" d="M72 224 L118 186 L152 204 L206 158 L252 192 L300 168 L346 190 L392 160 L440 196 V292 H72Z" fill="#B9CBB6" />
      <path className="pa-sky-bit" d="M72 240 L140 214 L210 230 L280 206 L360 228 L440 214 V292 H72Z" fill="#9DB79A" />
      <g className="pa-house">
        <rect x="72" y="252" width="368" height="40" fill="#4E9673" />
        <rect x="72" y="270" width="368" height="22" fill={GREEN} />
        {/* Main volume */}
        <rect x="166" y="178" width="148" height="80" fill="#fff" />
        <rect x="156" y="170" width="168" height="10" rx="2" fill={INK} />
        <rect x="182" y="194" width="74" height="50" rx="2" fill={TEAL} />
        <path d="M188 240 L226 198 L240 198 L202 240Z" fill="#fff" opacity=".14" />
        <rect x="216" y="194" width="3" height="50" fill="#fff" opacity=".7" />
        <rect x="270" y="206" width="22" height="52" rx="1.5" fill="#C8753A" />
        <circle cx="287" cy="232" r="1.8" fill={INK} />
        {/* Garage wing with timber slats */}
        <rect x="314" y="200" width="78" height="58" fill="#EFE7DB" />
        <rect x="308" y="194" width="90" height="8" rx="2" fill={INK} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x="324" y={212 + k * 7} width="58" height="3.5" rx="1" fill="#C9A37A" />
        ))}
        {/* Aloe and shrub */}
        <path d="M120 258 l-8 -26 l10 18 l2 -30 l5 30 l9 -22 l-6 30z" fill={GREEN} />
        <circle cx="414" cy="248" r="14" fill={TEAL} />
        <circle cx="428" cy="252" r="10" fill="#2F6B4F" />
        <rect x="150" y="256" width="250" height="4" rx="2" fill="#E9DCC8" />
      </g>
    </g>
  );
}

export default function AcreScene({ showBeats, active, onBeat }: ScenePieceProps) {
  return (
    <Scene title="Acre" beats={beats} build={build} showBeats={showBeats} active={active} onBeat={onBeat}>
      <svg viewBox="0 0 800 600" fontFamily={FONT}>
        <defs>
          <Shadow id="pa-sh" />
          <Shadow id="pa-sh-sm" y={8} blur={9} opacity={0.16} />
          <clipPath id="pa-imgclip"><rect x="72" y="80" width="368" height="212" rx="12" /></clipPath>
          <linearGradient id="pa-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FCDCC4" />
            <stop offset="1" stopColor="#FBF4EA" />
          </linearGradient>
        </defs>

        <g className="pa-all">
          {/* Listing card */}
          <g className="pa-listing">
            <g filter="url(#pa-sh)"><rect x="56" y="64" width="400" height="472" rx="20" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <g clipPath="url(#pa-imgclip)">
              <rect x="72" y="80" width="368" height="212" fill="url(#pa-sky)" />
              <circle className="pa-sky-bit" cx="388" cy="124" r="22" fill="#F7A27A" />
              <House />
            </g>
            {/* Status tag */}
            <g className="pa-tag-sale"><rect x="88" y="96" width="78" height="26" rx="13" fill="#fff" /><text x="127" y="113.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={INK}>For sale</text></g>
            <g className="pa-tag-sold"><rect x="88" y="96" width="64" height="26" rx="13" fill={ORANGE} /><text x="120" y="113.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill={INK}>Sold</text></g>
            <g className="pa-tag-let"><rect x="88" y="96" width="70" height="26" rx="13" fill={TEAL} /><text x="123" y="113.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill={CREAM}>To let</text></g>

            <g className="pa-text">
              <text x="76" y="326" fontSize="21" fontWeight="900" fill={INK} letterSpacing="-.5">12 Protea Lane</text>
              <text x="76" y="346" fontSize="12.5" fontWeight="500" fill={SOFT}>George · 3 bed · 2 bath</text>
            </g>
            <g className="pa-text">
              <text className="pa-price-sale" x="436" y="326" textAnchor="end" fontSize="17" fontWeight="900" fill={INK}>R 2 450 000</text>
              <text className="pa-price-let" x="436" y="326" textAnchor="end" fontSize="17" fontWeight="900" fill={INK}>R 14 500 <tspan fontSize="11" fontWeight="500" fill={SOFT}>/ month</tspan></text>
            </g>
            <rect className="pa-text" x="76" y="366" width="360" height="1" fill={LINE} />

            {/* Sale pipeline */}
            <g className="pa-pipe">
              <g className="pa-text">
                <text x="76" y="396" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>DEAL PROGRESS</text>
                <rect x="90" y="428" width="332" height="3" rx="1.5" fill={LINE} />
                <rect className="pa-progress" x="90" y="428" width="332" height="3" rx="1.5" fill={INK} />
                {STEPS.map((s, k) => (
                  <g key={s}>
                    <circle className={k > 0 ? `pa-step pa-step-${k}` : undefined} cx={90 + k * 83} cy="429.5" r="7" fill={k === 0 ? INK : "#fff"} stroke={k === 0 ? INK : LINE} strokeWidth="2" />
                    <text x={90 + k * 83} y="456" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK}>{s}</text>
                  </g>
                ))}
              </g>
              <g className="pa-text">
                <rect x="76" y="478" width="360" height="1" fill={LINE} />
                <Avatar x={92} y={506} c={ORANGE} i="TM" />
                <text x="116" y="503" fontSize="12" fontWeight="700" fill={INK}>Listed by Thandi M.</text>
                <text x="116" y="518" fontSize="10.5" fontWeight="500" fill={SOFT}>Agent</text>
                <rect x="320" y="494" width="116" height="24" rx="12" fill={CREAM} />
                <text x="378" y="510" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={INK}>Viewing · Sat 10:00</text>
              </g>
            </g>

            {/* Rental bookings */}
            <g className="pa-stays">
              <text x="76" y="396" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>BOOKINGS · NEXT 2 WEEKS</text>
              {Array.from({ length: 14 }).map((_, k) => (
                <rect key={k} x={76 + k * 26} y="410" width="22" height="22" rx="5" fill={CREAM} />
              ))}
              <rect className="pa-stay" x="102" y="410" width="74" height="22" rx="5" fill={ORANGE} />
              <rect className="pa-stay" x="232" y="410" width="48" height="22" rx="5" fill={ORANGE} />
              <rect className="pa-stay" x="76" y="440" width="360" height="22" rx="5" fill={GREEN} />
              <text x="86" y="455.5" fontSize="11" fontWeight="700" fill="#fff">Long lease · from the 1st</text>
              <circle cx="80" cy="490" r="4" fill={ORANGE} /><text x="90" y="494" fontSize="11" fontWeight="500" fill={SOFT}>Short stays</text>
              <circle cx="170" cy="490" r="4" fill={GREEN} /><text x="180" y="494" fontSize="11" fontWeight="500" fill={SOFT}>Long lease</text>
            </g>
          </g>

          {/* Deal room */}
          <g className="pa-room">
            <g filter="url(#pa-sh)"><rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height="292" rx="20" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <text x={PANEL.x + 20} y={PANEL.y + 34} fontSize="15" fontWeight="900" fill={INK} letterSpacing="-.3">Deal room</text>
            <rect x={PANEL.x + 186} y={PANEL.y + 18} width="64" height="24" rx="12" fill={CREAM} />
            <text x={PANEL.x + 218} y={PANEL.y + 34} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={INK}>5 roles</text>
            {ROWS.map((r, k) => {
              const y = PANEL.y + 74 + k * 54;
              const isBuyer = r.role === "Buyer";
              return (
                <g key={r.role} className="pa-row">
                  {k > 0 && <rect x={PANEL.x + 20} y={y - 27} width={PANEL.w - 40} height="1" fill={LINE} />}
                  <g className={isBuyer ? "pa-buyer" : undefined}>
                    <Avatar x={PANEL.x + 36} y={y} c={r.c} i={r.i} />
                    <text x={PANEL.x + 62} y={y - 2} fontSize="13" fontWeight="700" fill={INK}>{r.name}</text>
                    <text x={PANEL.x + 62} y={y + 13} fontSize="11" fontWeight="500" fill={SOFT}>{r.role}</text>
                  </g>
                  {isBuyer && (
                    <g className="pa-renter">
                      <Avatar x={PANEL.x + 36} y={y} c="#C8753A" i="JS" />
                      <text x={PANEL.x + 62} y={y - 2} fontSize="13" fontWeight="700" fill={INK}>Jono S.</text>
                      <text x={PANEL.x + 62} y={y + 13} fontSize="11" fontWeight="500" fill={SOFT}>Renter</text>
                    </g>
                  )}
                  <g className="pa-fica">
                    <rect x={PANEL.x + 180} y={y - 11} width="68" height="22" rx="11" fill="#E3EFE8" />
                    <circle cx={PANEL.x + 192} cy={y} r="6" fill={GREEN} />
                    <Check x={PANEL.x + 192} y={y} s={0.5} />
                    <text x={PANEL.x + 203} y={y + 4} fontSize="10.5" fontWeight="700" fill={GREEN}>FICA</text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Documents */}
          <g className="pa-docs">
            <g filter="url(#pa-sh)"><rect x={PANEL.x} y="376" width={PANEL.w} height="160" rx="20" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <text x={PANEL.x + 20} y="406" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>DOCUMENTS</text>
            {[
              ["Offer to purchase", "Signed by all parties"],
              ["Transfer documents", "Lodged"],
            ].map(([t, s], k) => (
              <g key={t} className="pa-doc">
                <rect x={PANEL.x + 20} y={422 + k * 52} width="30" height="38" rx="5" fill={CREAM} />
                <path d={`M${PANEL.x + 40} ${422 + k * 52} v9 h10`} fill="none" stroke={LINE} strokeWidth="2" />
                <text x={PANEL.x + 35} y={447 + k * 52} textAnchor="middle" fontSize="8" fontWeight="900" fill={ORANGE}>PDF</text>
                <text x={PANEL.x + 62} y={438 + k * 52} fontSize="13" fontWeight="700" fill={INK}>{t}</text>
                <text x={PANEL.x + 62} y={454 + k * 52} fontSize="11" fontWeight="500" fill={GREEN}>{s}</text>
              </g>
            ))}
          </g>

          {/* Bills */}
          <g className="pa-bills">
            <g filter="url(#pa-sh)"><rect x={PANEL.x} y="376" width={PANEL.w} height="160" rx="20" fill={PAPER} stroke={LINE} strokeWidth="1" /></g>
            <text x={PANEL.x + 20} y="406" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>THIS MONTH</text>
            {["Levies", "Rates", "Water and lights"].map((b, k) => (
              <g key={b} className="pa-bill">
                {k > 0 && <rect x={PANEL.x + 20} y={418 + k * 36} width={PANEL.w - 40} height="1" fill={LINE} />}
                <text x={PANEL.x + 20} y={441 + k * 36} fontSize="13" fontWeight="700" fill={INK}>{b}</text>
                <circle cx={PANEL.x + 238} cy={436 + k * 36} r="10" fill="none" stroke={LINE} strokeWidth="2" />
                <g className="pa-paid">
                  <rect x={PANEL.x + 182} y={426 + k * 36} width="66" height="20" rx="10" fill="#E3EFE8" />
                  <circle cx={PANEL.x + 238} cy={436 + k * 36} r="10" fill={GREEN} />
                  <Check x={PANEL.x + 238} y={436 + k * 36} s={0.6} />
                  <text x={PANEL.x + 192} y={440 + k * 36} fontSize="10.5" fontWeight="700" fill={GREEN}>Paid</text>
                </g>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </Scene>
  );
}
