import type { ComponentType } from "react";
import AcreDeal from "./AcreDeal";
import PinpointsPlayground from "./PinpointsPlayground";
import PrismToggle from "./PrismToggle";
import NodRoom from "./NodRoom";

/** Each venture's hands-on experiment. Optional: a venture without one skips the section. */
export const SIGNATURES: Record<string, { title: string; line: string; Component: ComponentType; fullBleed?: boolean }> = {
  acre: { title: "Run a deal.", line: "Scroll, and one property moves from listed to sold. Every party's view changes with it.", Component: AcreDeal, fullBleed: true },
  pinpoints: { title: "Leave some feedback.", line: "This is a made-up website. Pin it, change it, send it.", Component: PinpointsPlayground },
  prism: { title: "Edit a site without touching it.", line: "Code on the left, the live page on the right. Turn Prism on and change the page.", Component: PrismToggle },
  nod: { title: "Send a nod.", line: "You're checked in at a made-up workspace. Find someone open to chat.", Component: NodRoom },
};
