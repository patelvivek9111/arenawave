import { useCallback, useEffect, useRef } from 'react';

/**
 * Drives --aw-hero-fade (0→1) on heroRef from scroll through the hero.
 * Writes a CSS variable in rAF only — no React state — so fades stay paint-smooth.
 */
export function useHeroScrollFade(heroRef) {
  const frame = useRef(0);

  const measure = useCallback(() => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = rect.height || 1;
    const scrolled = Math.max(0, -rect.top);
    const p = Math.min(1, scrolled / (h * 0.42));
    el.style.setProperty('--aw-hero-fade', p.toFixed(4));
  }, [heroRef]);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        measure();
      });
    };

    measure();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [measure]);
}
