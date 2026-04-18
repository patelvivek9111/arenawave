import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function randomOutsidePoint(cw, ch, pad) {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * cw, y: -pad - Math.random() * ch * 0.5 };
  if (side === 1) return { x: cw + pad + Math.random() * cw * 0.5, y: Math.random() * ch };
  if (side === 2) return { x: Math.random() * cw, y: ch + pad + Math.random() * ch * 0.5 };
  return { x: -pad - Math.random() * cw * 0.5, y: Math.random() * ch };
}

/**
 * Slices the product image into a coarse grid; each tile flies in from outside and locks into place.
 * Reads as “pixels assembling” without thousands of DOM nodes. Respects prefers-reduced-motion.
 * `enabled` — start only when the parent block is visible (e.g. after scroll-reveal).
 */
export default function ProductPixelReveal({ src, alt, className = '', imgClassName = '', onComplete, enabled = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const ranRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setDone(true);
    onCompleteRef.current?.();
  }, []);

  useLayoutEffect(() => {
    if (reduced) {
      finish();
      return undefined;
    }
    if (!enabled) return undefined;

    const el = wrapRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas || ranRef.current) return undefined;
    ranRef.current = true;

    const imgEl = new Image();
    imgEl.onload = () => {
      const rect = el.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        finish();
        return;
      }
      ctx.scale(dpr, dpr);

      const iw = imgEl.naturalWidth;
      const ih = imgEl.naturalHeight;
      const scale = Math.min(cssW / iw, cssH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const ox = (cssW - dw) / 2;
      const oy = (cssH - dh) / 2;

      const isNarrow = cssW < 400;
      const cols = isNarrow ? 12 : 16;
      const rows = isNarrow ? 12 : 16;
      const pad = Math.max(cssW, cssH) * 0.35;

      const pieces = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const tx = ox + (col / cols) * dw;
          const ty = oy + (row / rows) * dh;
          const tw = dw / cols;
          const th = dh / rows;
          const sx = (col / cols) * iw;
          const sy = (row / rows) * ih;
          const sw = iw / cols;
          const sh = ih / rows;
          const start = randomOutsidePoint(cssW, cssH, pad);
          const wave = (col / cols + row / rows) * 0.35;
          const jitter = Math.random() * 0.22;
          pieces.push({
            sx,
            sy,
            sw,
            sh,
            tx,
            ty,
            tw,
            th,
            x0: start.x,
            y0: start.y,
            delay: (wave + jitter) * 520,
            dur: 640 + Math.random() * 380,
          });
        }
      }

      const startAt = performance.now();
      const maxT = Math.max(...pieces.map((p) => p.delay + p.dur)) + 120;

      const tick = (now) => {
        const t = now - startAt;
        ctx.clearRect(0, 0, cssW, cssH);

        for (const p of pieces) {
          const u = Math.min(1, Math.max(0, (t - p.delay) / p.dur));
          const e = easeOutCubic(u);
          const x = p.x0 + (p.tx - p.x0) * e;
          const y = p.y0 + (p.ty - p.y0) * e;
          ctx.drawImage(imgEl, p.sx, p.sy, p.sw, p.sh, x, y, p.tw, p.th);
        }

        if (t < maxT) {
          requestAnimationFrame(tick);
        } else {
          finish();
        }
      };

      requestAnimationFrame(tick);
    };

    imgEl.onerror = () => finish();
    imgEl.src = src;

    return undefined;
  }, [reduced, enabled, src, finish]);

  return (
    <div ref={wrapRef} className={`relative flex h-full w-full items-center justify-center ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`${imgClassName} ${done ? 'opacity-100' : 'opacity-0'}`.trim()}
        decoding="async"
      />
      {!reduced && !done ? (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 mx-auto max-h-full max-w-full"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
