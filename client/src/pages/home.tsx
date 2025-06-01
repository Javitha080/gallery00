
import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import LoadingScreen from "@/components/loading-screen";
import Hero from "@/components/hero";
import Gallery from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollToTop } from "@/hooks/use-scroll";
import { useLocation } from "wouter";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const { showScrollTop, scrollToTop } = useScrollToTop();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (id: number) => {
    setLocation(`/preview/${id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div>
          <Navigation />
          <Hero />
          <Gallery onItemClick={handleItemClick} />

          <AnimatePresence>
            {showScrollTop && (
              <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={scrollToTop}
                  className="glass hover:animate-glow rounded-full p-3 shadow-2xl border border-violet-400/30 hover:border-violet-400/60 transition-all duration-300"
                  size="icon"
                  aria-label="Scroll to top"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
