import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "3rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // Labs tokens, defined in src/index.css
        paper: "hsl(var(--paper))",
        mist: "hsl(var(--mist))",
        cream: "hsl(var(--cream))",
        line: "hsl(var(--line))",
        ink: { DEFAULT: "hsl(var(--ink))", soft: "hsl(var(--ink-soft))" },
        sand: "hsl(var(--sand))",
        orange: { DEFAULT: "hsl(var(--orange))", ink: "hsl(var(--orange-ink))" },
        teal: "hsl(var(--teal))",
        product: {
          acre: "hsl(var(--acre))",
          pinpoints: "hsl(var(--pinpoints))",
          prism: "hsl(var(--prism))",
          nod: "hsl(var(--nod))",
        },
        // shadcn semantic aliases, so shadcn components drop in unchanged
        border: "hsl(var(--line))",
        input: "hsl(var(--line))",
        ring: "hsl(var(--orange-ink))",
        background: "hsl(var(--paper))",
        foreground: "hsl(var(--ink))",
        primary: { DEFAULT: "hsl(var(--orange))", foreground: "hsl(var(--ink))" },
        secondary: { DEFAULT: "hsl(var(--teal))", foreground: "hsl(var(--paper))" },
        muted: { DEFAULT: "hsl(var(--mist))", foreground: "hsl(var(--ink-soft))" },
        accent: { DEFAULT: "hsl(var(--cream))", foreground: "hsl(var(--ink))" },
        card: { DEFAULT: "hsl(var(--paper))", foreground: "hsl(var(--ink))" },
      },
      fontFamily: {
        display: ["Noken", "Arial Black", "sans-serif"],
        body: ["Satoshi", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "1.25rem", xl: "1.5rem", "2xl": "2rem" },
      boxShadow: {
        lift: "0 1px 0 hsl(var(--ink) / .04), 0 24px 48px -28px hsl(var(--ink) / .25)",
        float: "0 2px 0 hsl(var(--ink) / .04), 0 40px 80px -36px hsl(var(--ink) / .35)",
      },
      transitionTimingFunction: { lab: "cubic-bezier(.22,1,.36,1)" },
    },
  },
  plugins: [animate],
} satisfies Config;
