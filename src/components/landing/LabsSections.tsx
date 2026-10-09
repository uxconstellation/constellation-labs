import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import ProcessFlight from "@/components/landing/ProcessFlight";
import NextConversation from "@/components/landing/NextConversation";
import clouds from "@/assets/cloud-layer-v3.webp";
import { LINKS } from "@/content/products";

/** Duplicated from the Constellation "How we get there" section, including the travelling tools. */
export function DeliveryProcess() {
  return (
    <section id="process" className="landing-section delivery-process">
      <div className="landing-container process-content">
        <ProcessFlight />
        <AnimatedContent>
          <p className="landing-eyebrow">How a product earns its patch</p>
          <h2 className="landing-heading mt-6">From our desk<br />to yours.</h2>
        </AnimatedContent>
        <div className="process-grid">
          {[
            ["Spot the problem", "Something slows our own studio work down, again and again."],
            ["Sketch the fix", "We build the smallest version that could solve it."],
            ["Use it ourselves", "It runs on live client work before anyone else sees it."],
            ["Open it up", "When it holds up, it earns its patch and opens to everyone."],
          ].map(([title, description], i) => (
            <AnimatedContent key={title} delay={i * 0.1}>
              <span className="process-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </AnimatedContent>
          ))}
        </div>
        <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-accent-foreground/70">Some products stay inside the studio. Some become companies of their own.</p>
      </div>
    </section>
  );
}

const questions = [
  ["Can my business use these products?", "Acre and Pinpoints are in beta and open to try. Prism is in early access, so we set it up with you. Nod is still in development, and you can join the pilot. Each product page says where it stands."],
  ["Do I need to be a Constellation client?", "No. The products stand on their own. If you'd like help setting one up, or something built around it, the studio can do that too."],
  ["Can you build a product like this for us?", "Yes. Labs is how we show what the studio builds. Bring the problem, and we'll help you work out the useful first version."],
  ["Why does a studio build its own products?", "Because we keep running into the same problems on client work. Fixing them for ourselves makes our work better, and some fixes are worth sharing."],
  ["What happens when a product grows up?", "It keeps its patch and gets a home of its own. Acre is heading that way first, onto acre.constellationlabs.cc."],
];

/** Duplicated from the Constellation "Before we start" FAQ. */
export function PracticalQuestions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="landing-section practical-questions">
      <div className="landing-container">
        <div className="faq-grid">
          <AnimatedContent>
            <p className="landing-eyebrow">A few useful answers</p>
            <h2 className="landing-heading mt-6">Before<br />you ask.</h2>
            <p className="mt-6 max-w-sm font-body text-base leading-relaxed text-foreground/70">What the products are for, who can use them, and how they connect to the studio.</p>
          </AnimatedContent>
          <div>
            {questions.map(([question, answer], i) => (
              <div key={question} className="faq-item">
                <h3>
                  <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} aria-controls={`faq-answer-${i}`} id={`faq-question-${i}`}>
                    <span>{question}</span>
                    <span className="faq-symbol">{open === i ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</span>
                  </button>
                </h3>
                <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} className={`faq-answer ${open === i ? "faq-open" : ""}`} aria-hidden={open !== i}>
                  <div><p>{answer}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Duplicated from the Constellation contact close, clouds and next-step card. Deviation: no form, it hands over to the studio. */
export function ContactClose() {
  return (
    <section id="contact" className="landing-section contact-landing labs-contact">
      <img className="contact-clouds" src={clouds} alt="" aria-hidden="true" />
      <div className="landing-container">
        <div className="contact-landing-grid labs-contact-grid">
          <AnimatedContent>
            <p className="landing-eyebrow">Like what you see?</p>
            <h2 className="landing-heading contact-title mt-6">We build these<br />for clients too.</h2>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-foreground/75">
              Constellation is a creative and build studio. Websites, apps, design, content and practical AI. Tell us what you want to make.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={LINKS.studioContact} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-8 py-3 font-body text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:brightness-110">
                Start a project
              </a>
              <a href={LINKS.email} className="landing-pill">Email Aldo</a>
            </div>
          </AnimatedContent>
          <NextConversation />
        </div>
      </div>
    </section>
  );
}
