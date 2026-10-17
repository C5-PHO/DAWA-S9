"use client";

import { useEffect } from "react";

// A single observer handles both the SSR catalog and new search results.
export default function GalleryMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cinema-app");
    if (!root || !window.IntersectionObserver) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          if (preference.matches) return;

          const card = target.classList.contains("movie-card");
          const index = card
            ? Array.from(target.parentElement?.children || []).indexOf(target)
            : 0;
          const animation = target.animate(
            [
              { opacity: 0, transform: `translateY(${card ? 22 : 14}px)` },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: card ? 650 : 750,
              delay: card ? (index % 5) * 55 : 0,
              easing: "cubic-bezier(.22, 1, .36, 1)",
              fill: "backwards",
            },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          animation.oncancel = () => animations.delete(animation);
        });
      },
      { threshold: 0.08 },
    );

    function observeContent() {
      root
        ?.querySelectorAll("[data-reveal], .movie-card")
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
    }
    function stopMotion() {
      if (preference.matches)
        animations.forEach((animation) => animation.cancel());
    }

    observeContent();
    const updates = new MutationObserver(observeContent);
    updates.observe(root, { childList: true, subtree: true });
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      updates.disconnect();
      preference.removeEventListener("change", stopMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return null;
}
