import React from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

/**
 * Fade + translate reveal on scroll. Pairs with .aw-reveal in index.css.
 * `fadeOnly` — wrapper only fades in; use for child-driven motion (e.g. use-case drop bounce).
 */
export default function Reveal({ children, className = '', delayMs = 0, fadeOnly = false }) {
  const [ref, visible] = useRevealOnScroll();
  const mode = fadeOnly ? 'aw-reveal-fade' : 'aw-reveal';

  return (
    <div
      ref={ref}
      className={`${mode} ${visible ? 'aw-reveal-visible' : ''} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
