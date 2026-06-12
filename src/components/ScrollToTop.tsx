import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const startY = window.scrollY;

    if (startY === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    const duration = 520;
    const startTime = window.performance.now();
    let frameId = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, Math.round(startY * (1 - easedProgress)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previousScrollBehavior;
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
