/** Adapted from David Haz / React Bits BlurText, see /licenses/reactbits.txt. */
import { motion, useReducedMotion } from "framer-motion";
export default function BlurText({ text, className = "", ready = true }: { text: string; className?: string; ready?: boolean }) {
  const reduced = useReducedMotion();
  return <span className={className} aria-hidden="true">{text.split(" ").map((word, i) => <motion.span key={i} className="inline-block"
    initial={reduced ? false : { opacity: 0, filter: "blur(12px)", y: 30 }}
    animate={ready ? { opacity: 1, filter: "blur(0px)", y: 0 } : undefined}
    transition={{ duration: reduced ? 0 : .9, delay: reduced ? 0 : i * .14, ease: [.16, 1, .3, 1] }}>
    {word}{i < text.split(" ").length - 1 ? "\u00a0" : ""}
  </motion.span>)}</span>;
}
