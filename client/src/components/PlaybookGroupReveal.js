import React from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

/**
 * One scroll-in for the whole "How it works" block: headline + cards share an observer
 * so everything can appear in one viewport with light stagger (delays on children).
 */
export default function PlaybookGroupReveal({ children, className = '' }) {
  const [ref, visible] = useRevealOnScroll({
    rootMargin: '0px 0px 25% 0px',
    threshold: 0.03,
  });

  return (
    <div
      ref={ref}
      className={`aw-playbook ${visible ? 'aw-playbook--visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
