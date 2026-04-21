import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function randomOutsidePoint(cw, ch, pad) {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * cw, y: -pad - Math.random() * ch * 0.45 };
  if (side === 1) return { x: cw + pad + Math.random() * cw * 0.45, y: Math.random() * ch };
  if (side === 2) return { x: Math.random() * cw, y: ch + pad + Math.random() * ch * 0.45 };
  return { x: -pad - Math.random() * cw * 0.45, y: Math.random() * ch };
}

/**
 * Full-bleed hero: same image URL as CSS background, object-cover slices fly in and settle,
 * then crossfades to the real bg layer (unchanged URL). Skips when prefers-reduced-motion.
 */
export default function HeroPixelBackdrop({ src, containerRef, onComplete }) {
  const canvasRef = useRef(null);
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState('drawing');
  const ranRef = useRef(false);
  const completedRef = useRef(false);
  /** Bumps each layout-effect run so Strict Mode (mount → cleanup → mount) does not leave a stale `ranRef` lock. */
  const effectGenRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('fade');
    onCompleteRef.current?.();
    window.setTimeout(() => setVisible(false), 800);
  }, []);

  useLayoutEffect(() => {
    if (reduced) {
      finish();
      return undefined;
    }

    const effectGen = (effectGenRef.current += 1);
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 240;

    const tryRun = () => {
      if (cancelled || effectGen !== effectGenRef.current || ranRef.current) return;
      attempts += 1;
      const el = containerRef?.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) {
        if (attempts >= maxAttempts) finish();
        else requestAnimationFrame(tryRun);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) {
        if (attempts >= maxAttempts) finish();
        else requestAnimationFrame(tryRun);
        return;
      }

      ranRef.current = true;

      const imgEl = new Image();
      imgEl.onload = () => {
        if (cancelled || effectGen !== effectGenRef.current) return;
        const r = el.getBoundingClientRect();
        const cssW = Math.max(1, r.width);
        const cssH = Math.max(1, r.height);
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
        const scale = Math.max(cssW / iw, cssH / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const ox = (cssW - dw) / 2;
        const oy = (cssH - dh) / 2;
        const pad = Math.max(cssW, cssH) * 0.4;

        const cols = cssW < 480 ? 12 : cssW < 1024 ? 16 : 20;
        const rows = Math.min(28, Math.max(11, Math.ceil(cols * (cssH / cssW))));

        const pieces = [];
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const tx = (col / cols) * cssW;
            const ty = (row / rows) * cssH;
            const tw = cssW / cols;
            const th = cssH / rows;

            const ix0 = Math.max(tx, ox);
            const iy0 = Math.max(ty, oy);
            const ix1 = Math.min(tx + tw, ox + dw);
            const iy1 = Math.min(ty + th, oy + dh);
            if (ix0 >= ix1 - 0.25 || iy0 >= iy1 - 0.25) continue;

            const destW = ix1 - ix0;
            const destH = iy1 - iy0;
            const sx = ((ix0 - ox) / dw) * iw;
            const sy = ((iy0 - oy) / dh) * ih;
            const sw = (destW / dw) * iw;
            const sh = (destH / dh) * ih;

            const start = randomOutsidePoint(cssW, cssH, pad);
            const wave = ((col / cols + row / rows) / 2) * 0.42;
            const jitter = Math.random() * 0.2;
            pieces.push({
              sx,
              sy,
              sw,
              sh,
              tx: ix0,
              ty: iy0,
              tw: destW,
              th: destH,
              x0: start.x,
              y0: start.y,
              delay: (wave + jitter) * 580,
              dur: 720 + Math.random() * 420,
            });
          }
        }

        if (pieces.length === 0) {
          finish();
          return;
        }

        const startAt = performance.now();
        const maxT = Math.max(...pieces.map((p) => p.delay + p.dur)) + 140;

        const tick = (now) => {
          if (cancelled || effectGen !== effectGenRef.current) return;
          try {
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
          } catch {
            finish();
          }
        };

        requestAnimationFrame(tick);
      };

      imgEl.onerror = () => {
        if (cancelled || effectGen !== effectGenRef.current) return;
        finish();
      };
      imgEl.src = src;
    };

    requestAnimationFrame(tryRun);
    return () => {
      cancelled = true;
      ranRef.current = false;
    };
  }, [reduced, src, containerRef, finish]);

  if (reduced || !visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ease-out ${
        phase === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden
    />
  );
}
