import React from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

/**
 * Scroll choreography for the Features block: headline first (blur + rise),
 * then staggered cards (rise + subtle scale).
 */
export default function ChoreoReveal({ children, className = '', delayMs = 0, role = 'card' }) {
  const isHeadline = role === 'headline';
  const [ref, visible] = useRevealOnScroll({
    rootMargin: isHeadline ? '0px 0px -3% 0px' : '0px 0px -10% 0px',
    threshold: isHeadline ? 0.12 : 0.08,
  });

  const base = isHeadline ? 'aw-choreo-headline' : 'aw-choreo-card';

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? `${base}-visible` : ''} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
