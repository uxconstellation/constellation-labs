/**
 * The funnel, per visitor: where they came from, where they landed, and the pages
 * they walked before getting in touch. Kept in sessionStorage only (one tab, gone
 * when it closes) and sent with the contact form, so every lead arrives with its path.
 */
const KEY = "labs-journey";

export type Journey = { landing: string; referrer: string; utm: Record<string, string>; pages: string[] };

const read = (): Journey | null => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
};
const write = (j: Journey) => { try { sessionStorage.setItem(KEY, JSON.stringify(j)); } catch { /* private mode: no trail, form still works */ } };

export function recordPage(path: string) {
  let j = read();
  if (!j) {
    const q = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    q.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v.slice(0, 80); });
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "direct";
    j = { landing: path, referrer: ref.slice(0, 200), utm, pages: [] };
  }
  if (j.pages[j.pages.length - 1] !== path) j.pages = [...j.pages, path].slice(-12);
  write(j);
}

export const getJourney = (): Journey => read() ?? { landing: location.pathname, referrer: "direct", utm: {}, pages: [location.pathname] };
