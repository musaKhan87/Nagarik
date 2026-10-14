import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Reset window scroll to top instantly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Also reset scroll on all scrollable main containers
    const scrollContainers = document.querySelectorAll("main, .overflow-y-auto");
    scrollContainers.forEach((container) => {
      if (container && container.scrollTop > 0) {
        container.scrollTop = 0;
      }
    });
  }, [pathname, search]);

  return null;
}
