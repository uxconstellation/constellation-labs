import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageTransition from "@/components/layout/PageTransition";
import Index from "@/pages/Index";
import ProductPage from "@/pages/ProductPage";
import NotFound from "@/pages/NotFound";
import ScenesPreview from "@/pages/ScenesPreview";
import PatchDefs from "@/components/patches/PatchDefs";

function RoutedPages() {
  const location = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <PatchDefs />
      <Navbar />
      <RoutedPages />
      <Footer />
    </BrowserRouter>
  );
}
