import Scene, { PAPER, Check, CREAM, FONT, GREEN, INK, LINE, ORANGE, SAND, Shadow, SOFT, TEAL, type Beat, type ScenePieceProps } from "./Scene";

const beats: Beat[] = [
  { at: 0.4, label: "Scan the code on your table" },
  { at: 2.4, label: "Say you're open to chat" },
  { at: 4.2, label: "Send a nod" },
  { at: 5.8, label: "They nod back" },
  { at: 7.4, label: "Connected, venue and date saved" },
];

// Phone A (you) screen: x108..340, y52..548. Phone B (Sam) screen: x464..680, y88..552, rotated 5deg.
const A = { x: 108, y: 52, w: 232, h: 496 };
const B = { x: 464, y: 88, w: 216, h: 464 };
const PEOPLE = [
  { i: "SA", name: "Sam", note: "Open to chat", c: GREEN, nod: true },
  { i: "LE", name: "Lee", note: "Working quietly", c: SAND, nod: false },
  { i: "AV", name: "Ava", note: "Open to chat", c: TEAL, nod: true },
];

function build(tl: gsap.core.Timeline) {
  tl.set(".nd-all", { opacity: 1 }, 0)
    .set(".nd-phone-a", { opacity: 0, y: 40 }, 0)
    .set(".nd-phone-b", { opacity: 0, y: 60 }, 0)
    .set(".nd-scan", { opacity: 1 }, 0)
    .set(".nd-scanline", { y: 0 }, 0)
    .set(".nd-bracket", { stroke: ORANGE }, 0)
    .set(".nd-main", { opacity: 0 }, 0)
    .set(".nd-knob", { x: 0 }, 0)
    .set(".nd-track", { fill: LINE }, 0)
    .set(".nd-person", { opacity: 0, y: 10 }, 0)
    .set(".nd-btn-sam", { fill: INK, scale: 1, transformOrigin: "50% 50%" }, 0)
    .set(".nd-btn-sam-t", { opacity: 1 }, 0)
    .set([".nd-btn-sam-sent", ".nd-btn-sam-mutual"], { opacity: 0 }, 0)
    .set(".nd-notif", { opacity: 0, y: -30 }, 0)
    .set(".nd-back-bg", { fill: INK, scale: 1, transformOrigin: "50% 50%" }, 0)
    .set(".nd-back-t", { opacity: 1 }, 0)
    .set(".nd-back-ok", { opacity: 0 }, 0)
    .set(".nd-nod", { opacity: 0, x: 281, y: 307 }, 0)
    .set(".nd-nod-dot", { fill: ORANGE }, 0)
    .set(".nd-sheet", { y: 240 }, 0)
    .set(".nd-sheet-row", { opacity: 0, x: -8 }, 0);

  // 01 Scan
  tl.to(".nd-phone-a", { opacity: 1, y: 0, duration: 0.9 }, 0.05)
    .to(".nd-phone-b", { opacity: 1, y: 0, duration: 0.9 }, 0.3)
    .to(".nd-scanline", { y: 84, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.9)
    .to(".nd-bracket", { stroke: TEAL, duration: 0.2 }, 1.95)
    .fromTo(".nd-qr-ok", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(2.6)" }, 1.95)
    .to(".nd-scan", { opacity: 0, duration: 0.35 }, 2.35)
    .to(".nd-main", { opacity: 1, duration: 0.35 }, 2.35);

  // 02 Open to chat, see who's here
  tl.to(".nd-knob", { x: 16, duration: 0.3, ease: "power2.inOut" }, 2.9)
    .to(".nd-track", { fill: GREEN, duration: 0.3 }, 2.9)
    .to(".nd-person", { opacity: 1, y: 0, duration: 0.4, stagger: 0.14 }, 3.3);

  // 03 Nod at Sam
  tl.to(".nd-btn-sam", { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, 4.2)
    .to(".nd-btn-sam-t", { opacity: 0, duration: 0.1 }, 4.35)
    .to(".nd-btn-sam-sent", { opacity: 1, duration: 0.15 }, 4.4)
    .to(".nd-btn-sam", { fill: SOFT, duration: 0.2 }, 4.35)
    .to(".nd-nod", { opacity: 1, duration: 0.1 }, 4.4)
    .to(".nd-nod", { motionPath: { path: [{ x: 281, y: 307 }, { x: 420, y: 150 }, { x: 560, y: 246 }], curviness: 1.3 }, duration: 0.85, ease: "power2.inOut" }, 4.4)
    .to(".nd-nod", { opacity: 0, scale: 0.4, duration: 0.2 }, 5.2)
    .to(".nd-notif", { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }, 5.15);

  // 04 Sam nods back
  tl.set(".nd-nod-dot", { fill: GREEN }, 5.9)
    .set(".nd-nod", { scale: 1, x: 566, y: 305 }, 5.9)
    .to(".nd-back-bg", { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, 5.85)
    .to(".nd-back-bg", { fill: GREEN, duration: 0.2 }, 6.0)
    .to(".nd-back-t", { opacity: 0, duration: 0.1 }, 6.0)
    .to(".nd-back-ok", { opacity: 1, duration: 0.15 }, 6.05)
    .to(".nd-nod", { opacity: 1, duration: 0.1 }, 6.05)
    .to(".nd-nod", { motionPath: { path: [{ x: 566, y: 305 }, { x: 430, y: 470 }, { x: 281, y: 307 }], curviness: 1.3 }, duration: 0.85, ease: "power2.inOut" }, 6.05)
    .to(".nd-nod", { opacity: 0, scale: 0.4, duration: 0.2 }, 6.85)
    .to(".nd-btn-sam-sent", { opacity: 0, duration: 0.1 }, 6.85)
    .to(".nd-btn-sam", { fill: GREEN, duration: 0.2 }, 6.85)
    .to(".nd-btn-sam-mutual", { opacity: 1, duration: 0.15 }, 6.9);

  // 05 It's mutual, on both phones
  tl.to(".nd-sheet-a", { y: 0, duration: 0.6, ease: "power3.out" }, 7.4)
    .to(".nd-sheet-b", { y: 0, duration: 0.6, ease: "power3.out" }, 7.55)
    .to(".nd-sheet-row", { opacity: 1, x: 0, duration: 0.35, stagger: 0.1 }, 7.9)
    .addLabel("hold", 9.2)
    .to(".nd-all", { opacity: 0, duration: 0.6 }, 10.4);
}

function Avatar({ x, y, c, i, r = 15 }: { x: number; y: number; c: string; i: string; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={c} />
      <text x={x} y={y + r * 0.27} textAnchor="middle" fontSize={r * 0.66} fontWeight="900" fill="#fff">{i}</text>
    </>
  );
}

function StatusBar({ x, w, y }: { x: number; w: number; y: number }) {
  return (
    <>
      <text x={x + 22} y={y + 24} fontSize="11" fontWeight="700" fill={INK}>9:41</text>
      <rect x={x + w / 2 - 34} y={y + 10} width="68" height="20" rx="10" fill={INK} />
      <rect x={x + w - 42} y={y + 15} width="20" height="10" rx="3" fill="none" stroke={INK} strokeWidth="1.4" />
      <rect x={x + w - 40} y={y + 17} width="13" height="6" rx="1.5" fill={INK} />
    </>
  );
}

function Mutual({ x, y, w, cls, other }: { x: number; y: number; w: number; cls: string; other: { i: string; c: string; name: string } }) {
  return (
    <g className={`nd-sheet ${cls}`}>
      <rect x={x} y={y} width={w} height="226" rx="26" fill={PAPER} stroke={LINE} strokeWidth="1" />
      <rect x={x + w / 2 - 18} y={y + 10} width="36" height="4" rx="2" fill={LINE} />
      <Avatar x={x + w / 2 - 14} y={y + 50} c={other.c} i={other.i} r={20} />
      <circle cx={x + w / 2 + 14} cy={y + 50} r="21.5" fill="#fff" />
      <Avatar x={x + w / 2 + 14} y={y + 50} c={other.i === "SA" ? ORANGE : GREEN} i={other.i === "SA" ? "AL" : "SA"} r={20} />
      <text x={x + w / 2} y={y + 96} textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1.6" fill={SOFT}>IT'S MUTUAL</text>
      <text x={x + w / 2} y={y + 118} textAnchor="middle" fontSize="18" fontWeight="900" fill={INK} letterSpacing="-.4">You and {other.name}</text>
      <g className="nd-sheet-row">
        <rect x={x + 14} y={y + 134} width={w - 28} height="34" rx="10" fill={CREAM} />
        <path d={`M${x + 32} ${y + 142} c-5 0 -8 3.5 -8 7.5 c0 5 8 11 8 11 s8 -6 8 -11 c0 -4 -3 -7.5 -8 -7.5z`} fill={ORANGE} />
        <circle cx={x + 32} cy={y + 149.5} r="2.6" fill="#fff" />
        <text x={x + 48} y={y + 155.5} fontSize="12" fontWeight="700" fill={INK}>The Workroom</text>
      </g>
      <g className="nd-sheet-row">
        <rect x={x + 14} y={y + 174} width={w - 28} height="34" rx="10" fill={CREAM} />
        <rect x={x + 25} y={y + 183} width="15" height="15" rx="3" fill="none" stroke={TEAL} strokeWidth="2" />
        <path d={`M${x + 25} ${y + 188} H${x + 40}`} stroke={TEAL} strokeWidth="2" />
        <text x={x + 48} y={y + 195.5} fontSize="12" fontWeight="700" fill={INK}>Met today · saved</text>
      </g>
    </g>
  );
}

export default function NodScene({ showBeats, active, onBeat }: ScenePieceProps) {
  const qx = A.x + A.w / 2;
  const qy = 288;
  return (
    <Scene title="Nod" beats={beats} build={build} showBeats={showBeats} active={active} onBeat={onBeat}>
      <svg viewBox="0 0 800 600" fontFamily={FONT}>
        <defs>
          <Shadow id="nd-sh" y={26} blur={26} opacity={0.22} />
          <Shadow id="nd-sh-sm" y={8} blur={9} opacity={0.18} />
          <clipPath id="nd-clip-a"><rect x={A.x} y={A.y} width={A.w} height={A.h} rx="30" /></clipPath>
          <clipPath id="nd-clip-b"><rect x={B.x} y={B.y} width={B.w} height={B.h} rx="28" /></clipPath>
          <radialGradient id="nd-blur" cx=".5" cy=".55" r=".7">
            <stop offset="0" stopColor="#8C6A4A" />
            <stop offset="1" stopColor="#3A2E30" />
          </radialGradient>
        </defs>

        <g className="nd-all">
          {/* Phone B: Sam */}
          <g className="nd-phone-b">
            <g transform="rotate(5 572 320)">
              <g filter="url(#nd-sh)"><rect x={B.x - 12} y={B.y - 12} width={B.w + 24} height={B.h + 24} rx="38" fill={INK} /></g>
              <g clipPath="url(#nd-clip-b)">
                <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={CREAM} />
                <StatusBar x={B.x} w={B.w} y={B.y} />
                <text x={B.x + 18} y={B.y + 66} fontSize="9.5" fontWeight="700" letterSpacing="1.6" fill={SOFT}>CHECKED IN</text>
                <text x={B.x + 18} y={B.y + 90} fontSize="20" fontWeight="900" fill={INK} letterSpacing="-.5">The Workroom</text>
                <text x={B.x + 18} y={B.y + 108} fontSize="11" fontWeight="500" fill={SOFT}>Table 2 · Open to chat</text>
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={B.x + 18} y={B.y + 290 + k * 40} width={B.w - 36} height="28" rx="8" fill="#fff" opacity=".6" />
                ))}
                <g className="nd-notif" filter="url(#nd-sh-sm)">
                  <rect x={B.x + 12} y={B.y + 126} width={B.w - 24} height="128" rx="18" fill={PAPER} stroke={LINE} strokeWidth="1" />
                  <Avatar x={B.x + 40} y={B.y + 158} c={ORANGE} i="AL" />
                  <text x={B.x + 62} y={B.y + 155} fontSize="12.5" fontWeight="900" fill={INK}>Alex nodded</text>
                  <text x={B.x + 62} y={B.y + 170} fontSize="10.5" fontWeight="500" fill={SOFT}>Table 4 · 2m away</text>
                  <rect className="nd-back-bg" x={B.x + 26} y={B.y + 196} width={B.w - 52} height="38" rx="19" fill={INK} />
                  <text className="nd-back-t" x={B.x + B.w / 2} y={B.y + 219.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">Nod back</text>
                  <g className="nd-back-ok"><Check x={B.x + B.w / 2 - 30} y={B.y + 215} s={0.85} /><text x={B.x + B.w / 2 - 18} y={B.y + 219.5} fontSize="13" fontWeight="700" fill="#fff">Nodded</text></g>
                </g>
                <Mutual x={B.x} y={B.y + B.h - 226} w={B.w} cls="nd-sheet-b" other={{ i: "AL", c: ORANGE, name: "Alex" }} />
              </g>
            </g>
          </g>

          {/* Phone A: you */}
          <g className="nd-phone-a">
            <g filter="url(#nd-sh)"><rect x={A.x - 12} y={A.y - 12} width={A.w + 24} height={A.h + 24} rx="40" fill={INK} /></g>
            <g clipPath="url(#nd-clip-a)">
              {/* Camera scan */}
              <g className="nd-scan">
                <rect x={A.x} y={A.y} width={A.w} height={A.h} fill="url(#nd-blur)" />
                <ellipse cx={A.x + 40} cy="430" rx="40" ry="26" fill="#fff" opacity=".12" />
                <ellipse cx={A.x + 200} cy="470" rx="30" ry="20" fill="#fff" opacity=".1" />
                <text x={qx} y="120" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">Scan the code on your table</text>
                <rect x={qx - 44} y={qy - 44} width="88" height="88" rx="10" fill="#fff" />
                {[[0, 0], [1, 0], [0, 1], [4, 0], [5, 1], [2, 2], [3, 3], [0, 5], [1, 4], [5, 5], [3, 5], [5, 3], [2, 0], [4, 4]].map(([cx, cy], k) => (
                  <rect key={k} x={qx - 33 + cx * 11} y={qy - 33 + cy * 11} width="10" height="10" rx="2" fill={INK} />
                ))}
                {[
                  [-58, -58, 1, 1], [58, -58, -1, 1], [-58, 58, 1, -1], [58, 58, -1, -1],
                ].map(([dx, dy, sx, sy], k) => (
                  <path key={k} className="nd-bracket" d={`M${qx + dx} ${qy + dy + 18 * sy} V${qy + dy} H${qx + dx + 18 * sx}`} fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
                ))}
                <rect className="nd-scanline" x={qx - 50} y={qy - 44} width="100" height="3" rx="1.5" fill={ORANGE} />
                <g className="nd-qr-ok"><circle cx={qx} cy={qy + 96} r="16" fill={TEAL} /><Check x={qx} y={qy + 96} s={1} color={INK} /></g>
                <circle cx={qx} cy={A.y + A.h - 46} r="24" fill="none" stroke="#fff" strokeWidth="3" />
                <circle cx={qx} cy={A.y + A.h - 46} r="18" fill="#fff" />
              </g>

              {/* Checked in */}
              <g className="nd-main">
                <rect x={A.x} y={A.y} width={A.w} height={A.h} fill={CREAM} />
                <StatusBar x={A.x} w={A.w} y={A.y} />
                <text x={A.x + 18} y={A.y + 66} fontSize="9.5" fontWeight="700" letterSpacing="1.6" fill={SOFT}>CHECKED IN</text>
                <text x={A.x + 18} y={A.y + 92} fontSize="22" fontWeight="900" fill={INK} letterSpacing="-.6">The Workroom</text>
                <text x={A.x + 18} y={A.y + 110} fontSize="11.5" fontWeight="500" fill={SOFT}>Table 4 · Coworking</text>

                <rect x={A.x + 14} y={A.y + 126} width={A.w - 28} height="62" rx="16" fill={PAPER} stroke={LINE} strokeWidth="1" />
                <text x={A.x + 30} y={A.y + 153} fontSize="13.5" fontWeight="700" fill={INK}>Open to chat</text>
                <text x={A.x + 30} y={A.y + 170} fontSize="10.5" fontWeight="500" fill={SOFT}>People here can nod at you</text>
                <rect className="nd-track" x={A.x + A.w - 66} y={A.y + 145} width="40" height="24" rx="12" fill={LINE} />
                <circle className="nd-knob" cx={A.x + A.w - 54} cy={A.y + 157} r="9" fill="#fff" />

                <text x={A.x + 18} y={A.y + 222} fontSize="9.5" fontWeight="700" letterSpacing="1.6" fill={SOFT}>HERE NOW</text>
                {PEOPLE.map((p, k) => {
                  const y = A.y + 254 + k * 56;
                  const isSam = k === 0;
                  return (
                    <g key={p.name} className="nd-person" opacity={p.nod ? 1 : 0.55}>
                      <rect x={A.x + 14} y={y - 22} width={A.w - 28} height="46" rx="14" fill={PAPER} stroke={LINE} strokeWidth="1" />
                      <Avatar x={A.x + 38} y={y + 1} c={p.c} i={p.i} />
                      <text x={A.x + 60} y={y - 1} fontSize="13" fontWeight="700" fill={INK}>{p.name}</text>
                      <text x={A.x + 60} y={y + 14} fontSize="10.5" fontWeight="500" fill={p.nod ? GREEN : SOFT}>{p.note}</text>
                      {p.nod && (
                        <g>
                          <rect className={isSam ? "nd-btn-sam" : undefined} x={A.x + A.w - 92} y={y - 12} width="66" height="26" rx="13" fill={INK} />
                          <text className={isSam ? "nd-btn-sam-t" : undefined} x={A.x + A.w - 59} y={y + 5.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">Nod</text>
                          {isSam && (
                            <>
                              <text className="nd-btn-sam-sent" x={A.x + A.w - 59} y={y + 5.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">Sent</text>
                              <text className="nd-btn-sam-mutual" x={A.x + A.w - 59} y={y + 5.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">Mutual</text>
                            </>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
                <Mutual x={A.x} y={A.y + A.h - 226} w={A.w} cls="nd-sheet-a" other={{ i: "SA", c: GREEN, name: "Sam" }} />
              </g>
            </g>
          </g>

          {/* The nod in flight */}
          <g className="nd-nod">
            <g filter="url(#nd-sh-sm)"><circle className="nd-nod-dot" r="18" fill={ORANGE} /></g>
            <path d="M-7 -1 q7 9 14 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-5" cy="-7" r="2" fill="#fff" /><circle cx="5" cy="-7" r="2" fill="#fff" />
          </g>
        </g>
      </svg>
    </Scene>
  );
}
