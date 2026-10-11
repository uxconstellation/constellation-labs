/**
 * Constellation Labs Worker. Two jobs:
 * 1. POST /api/contact sends the lead as an email (Cloudflare Email Sending on the
 *    `EMAIL` binding, from send.constellationlab.cc). Same pattern as the Sun Savings
 *    enquiry Worker: recipient in [vars], Reply-To is the enquirer, headers built from
 *    visitor input are flattened and validated, plain-text body, honest delivered flag.
 * 2. Everything else goes to the static build, with noindex on review hosts.
 *
 * The lead carries its funnel: intent, venture, the page before the form, landing
 * page, referrer, UTM tags and the pages walked. No database: a lead is an email.
 */
type Env = {
  ASSETS: Fetcher;
  CONTACT_TO?: string;
  EMAIL: {
    send(message: { to: string; from: { email: string; name?: string }; replyTo?: string; subject: string; text: string }): Promise<unknown>;
  };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const headerSafe = (v: string) => v.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
const isEmail = (v: string | undefined): v is string => !!v && /^[^\s@,;:<>"]+@[^\s@,;:<>"]+\.[^\s@,;:<>"]+$/.test(v);

const INTENTS: Record<string, string> = {
  invest: "Investor",
  build: "Build with the studio",
  prism: "Prism demo",
  pinpoints: "Pinpoints invite",
  nod: "Nod pilot",
  acre: "Acre",
  other: "General",
};

async function contact(request: Request, env: Env): Promise<Response> {
  let f: Record<string, string>;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    f = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 3000) : JSON.stringify(v).slice(0, 3000)]));
  } catch {
    return json({ ok: false, delivered: false, reason: "bad-request" }, 400);
  }
  if (f.website) return json({ ok: true, delivered: true, reason: "sent" }); // honeypot: bots fill it, people never see it
  if (!isEmail(f.email)) return json({ ok: false, delivered: false, reason: "email-required" }, 400);
  if (!env.CONTACT_TO) return json({ ok: true, delivered: false, reason: "no-recipient-configured" });

  const intent = INTENTS[f.intent] ?? INTENTS.other;
  const who = headerSafe(f.name || f.email);
  const text = [
    `New ${intent.toLowerCase()} lead from Constellation Labs.`,
    "",
    `Name: ${f.name || "-"}`,
    `Email: ${f.email}`,
    `Company: ${f.company || "-"}`,
    `Intent: ${intent}`,
    f.product ? `Product they named: ${f.product}` : "",
    "",
    "Message:",
    f.message || "-",
    "",
    "Funnel",
    `Came from page: ${f.from || "-"}`,
    `Landed on: ${f.landing || "-"}`,
    `Referrer: ${f.referrer || "-"}`,
    `UTM: ${f.utm || "-"}`,
    `Path: ${f.pages || "-"}`,
    "",
    `Received ${new Date().toISOString()} via ${new URL(request.url).host}`,
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

  try {
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: { email: "labs@send.constellationlab.cc", name: "Constellation Labs" },
      replyTo: f.email,
      subject: headerSafe(`Labs lead: ${intent}, ${who}`),
      text,
    });
    return json({ ok: true, delivered: true, reason: "sent" });
  } catch {
    return json({ ok: false, delivered: false, reason: "send-failed" }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ ok: false, reason: "method-not-allowed" }, 405);
      return contact(request, env);
    }
    const res = await env.ASSETS.fetch(request);
    // Review hosts stay out of search; the production domain does not get the header.
    if (url.hostname.endsWith(".workers.dev")) {
      const out = new Response(res.body, res);
      out.headers.set("x-robots-tag", "noindex, nofollow");
      return out;
    }
    return res;
  },
};
