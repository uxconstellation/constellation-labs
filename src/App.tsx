import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import PatchDefs from "@/components/patches/PatchDefs";
import Index from "@/pages/Index";
import ProductPage from "@/pages/ProductPage";
import Invest from "@/pages/Invest";
import Build from "@/pages/Build";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import { recordPage } from "@/lib/journey";
import ScenesPreview from "@/pages/ScenesPreview";

function RoutedPages() {
  const location = useLocation();
  useEffect(() => recordPage(location.pathname), [location.pathname]);
  useEffect(() => {
    if (location.hash) {
      // Wait for the new page to mount, then land on the anchor.
      const id = location.hash.slice(1);
      const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 650);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/invest" element={<PageTransition><Invest /></PageTransition>} />
        <Route path="/build" element={<PageTransition><Build /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/scenes" element={<PageTransition><ScenesPreview /></PageTransition>} />
        <Route path="/:slug" element={<PageTransition><ProductPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <PatchDefs />
      <Nav />
      <RoutedPages />
      <Footer />
    </BrowserRouter>
  );
}
