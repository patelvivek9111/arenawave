import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_DISPLAY_NAME } from '../config/product';
import { useHeroScrollFade } from '../hooks/useHeroScrollFade';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import Reveal from '../components/Reveal';
import ChoreoReveal from '../components/ChoreoReveal';
import PlaybookGroupReveal from '../components/PlaybookGroupReveal';
import { HowItWorksFlowConnector, HowItWorksStepArt } from '../components/howItWorks/HowItWorksStepArt';
import ProductPixelReveal from '../components/ProductPixelReveal';
import HeroPixelBackdrop from '../components/HeroPixelBackdrop';

/** Same-origin so CSP / third-party blocks on production cannot strip the hero photo */
const HERO_BG = `${process.env.PUBLIC_URL || ''}/hero-venue.jpg`;

const USE_CASES = [
  {
    title: 'Football',
    tag: 'American football',
    src: 'https://images.unsplash.com/photo-1759808418405-c9693ad62957?auto=format&fit=crop&w=1400&q=82',
    alt: 'Spectators at an American football game in a modern stadium',
  },
  {
    title: 'Soccer',
    tag: 'World football',
    src: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=82',
    alt: 'Soccer stadium and crowd',
  },
  {
    title: 'Cricket',
    tag: 'Test & T20',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Narendra_modi_stadium_2023_Final_between_India_and_Australia.jpg/1920px-Narendra_modi_stadium_2023_Final_between_India_and_Australia.jpg',
    alt: 'Narendra Modi Stadium in Ahmedabad during the 2023 Cricket World Cup final, crowd and ground visible',
  },
  {
    title: 'Live music',
    tag: 'Tours & festivals',
    src: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=82',
    alt: 'Concert crowd',
  },
];

/** Entry direction per tile (shuffled order so it feels random, stable per index) */
const USE_CASE_ENTRY_FROM = ['top', 'right', 'bottom', 'left'];

function IconRadio({ className = 'w-7 h-7 text-zinc-700' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M2.75 8.75a15 15 0 0118.5 0M5.75 12a10.5 10.5 0 0112.5 0M9 15.25a6 6 0 016 0" />
      <circle cx="12" cy="18.2" r="1.05" fill="currentColor" stroke="none" />
      <path strokeWidth={1.9} strokeLinecap="round" d="M4 4l16 16" />
    </svg>
  );
}

function IconSync({ className = 'w-7 h-7 text-zinc-700' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function IconScale({ className = 'w-7 h-7 text-zinc-700' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function IconGlobe({ className = 'w-7 h-7 text-zinc-700' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: IconRadio,
    title: 'No internet',
    line: "Venue RF. Not the crowd's cell service.",
    ticketId: 'AW-2401',
    gate: 'RF',
  },
  {
    icon: IconSync,
    title: 'In sync',
    line: 'Audio aligned with what fans see.',
    ticketId: 'AW-2402',
    gate: 'SYNC',
  },
  {
    icon: IconScale,
    title: 'Stadium scale',
    line: 'Tens of thousands. One feed.',
    ticketId: 'AW-2403',
    gate: 'SCALE',
  },
  {
    icon: IconGlobe,
    title: 'Global',
    line: 'Same stack in any market.',
    ticketId: 'AW-2404',
    gate: 'INTL',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Transmit',
    line: 'Venue sends commentary over broadcast.',
    phase: 'TX',
    visual: 'clipboard',
    propLabel: 'Run sheet',
  },
  {
    step: '02',
    title: 'Receive',
    line: 'Earwing locks to the signal instantly.',
    phase: 'RX',
    visual: 'radio',
    propLabel: 'Sideline comms',
  },
  {
    step: '03',
    title: 'Hear',
    line: 'Every fan gets the same moment.',
    phase: 'OUT',
    visual: 'headphones',
    propLabel: 'In-venue audio',
  },
];

function initialReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const Home = () => {
  const heroRef = useRef(null);
  useHeroScrollFade(heroRef);
  const [productCopyRevealed, setProductCopyRevealed] = useState(initialReducedMotion);
  const onProductPixelsComplete = useCallback(() => setProductCopyRevealed(true), []);
  const [productRevealRef, productRevealVisible] = useRevealOnScroll();
  const [heroPixelReady, setHeroPixelReady] = useState(initialReducedMotion);

  return (
    <div className="bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900/10">
      {/* Hero — dark scrim; bottom/top light fades ramp up while scrolling */}
      <section
        id="aw-home-hero"
        ref={heroRef}
        className="relative isolate min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
      >
        <div
          className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-[1.02] transition-opacity duration-700 ease-out ${
            heroPixelReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${HERO_BG})` }}
          aria-hidden
        />
        <HeroPixelBackdrop src={HERO_BG} containerRef={heroRef} onComplete={() => setHeroPixelReady(true)} />
        <div className="absolute inset-0 z-[2] bg-black/78" aria-hidden />
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/55 via-black/25 to-black/65" aria-hidden />
        {/* Top fade — subtle until scroll (eases letterbox / nav handoff) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-28 md:h-36 bg-gradient-to-b from-stone-50 to-transparent will-change-[opacity]"
          style={{ opacity: 'calc(var(--aw-hero-fade) * 0.55)' }}
          aria-hidden
        />
        {/* Bottom fade into next section — grows with scroll (CSS var = no React churn) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent will-change-[opacity,height]"
          style={{
            height: 'calc(8% + var(--aw-hero-fade) * 62%)',
            opacity: 'calc(0.05 + var(--aw-hero-fade) * 0.95)',
          }}
          aria-hidden
        />

        <Reveal className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 text-center pt-28 pb-24 md:pt-32 md:pb-32">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-zinc-300 mb-10 md:mb-14 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
            ArenaWave
          </p>
          <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85),0_4px_48px_rgba(0,0,0,0.5)]">
            Live audio.
            <span className="block mt-2 md:mt-4 text-zinc-200 font-normal tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.8)]">
              Every seat.
            </span>
          </h1>
          <p className="mt-10 md:mt-14 text-base sm:text-lg md:text-xl text-zinc-200 font-light max-w-lg mx-auto leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
            Real-time, synchronized sound for venues worldwide—without relying on fan connectivity.
          </p>
          <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center min-h-[48px] px-10 rounded-full bg-white text-zinc-950 text-sm font-semibold tracking-wide hover:bg-zinc-100 transition-colors duration-300 w-full sm:w-auto shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
            >
              Shop Earwing
            </Link>
            <span className="text-sm text-zinc-200 [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
              {PRODUCT_DISPLAY_NAME}
            </span>
            {/* Launch hold: restore price next to CTA — usePricing (geoReady, formatPrice, unitPrice), skeleton, and “price · name” row */}
          </div>
        </Reveal>
      </section>

      {/* Features — event-ticket cards + scroll choreography */}
      <section className="border-t border-stone-200/80 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(120,113,108,0.08),transparent_55%),linear-gradient(180deg,#fafaf9_0%,#ffffff_45%,#fafaf9_100%)] overflow-x-clip">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-28 md:py-40 lg:py-48">
          <ChoreoReveal role="headline">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-zinc-900 text-center max-w-2xl mx-auto leading-[1.05]">
              Built for the venue.
            </h2>
            <p className="mt-5 text-center text-sm font-medium uppercase tracking-[0.25em] text-zinc-400">
              Admit all sections
            </p>
          </ChoreoReveal>
          <div className="mt-16 md:mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-7 md:gap-6 lg:gap-5 items-stretch">
            {FEATURES.map(({ icon: Icon, title, line, ticketId, gate }, i) => (
              <ChoreoReveal key={title} delayMs={140 + i * 115} className="h-full min-h-0">
                <article className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-stone-300/80 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_40px_-18px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.03)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_24px_56px_-24px_rgba(0,0,0,0.22)]">
                  {/* Ticket header — like a printed stub */}
                  <div className="relative bg-[#121212] px-5 pt-5 pb-5 text-left ring-1 ring-white/[0.06]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                          ArenaWave
                        </p>
                        <p className="mt-2 font-mono text-[11px] font-semibold tracking-wider text-white tabular-nums">
                          {ticketId}
                        </p>
                        <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.35em] text-zinc-500">
                          Live audio · {gate}
                        </p>
                      </div>
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2C2C2C] ring-1 ring-white/[0.08]"
                        aria-hidden
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Perforation + notches */}
                  <div className="relative flex h-4 shrink-0 items-center justify-center bg-stone-100/90">
                    <div
                      className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-stone-400/90"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute -left-2 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 rounded-full border border-stone-300/90 bg-[#fafaf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute -right-2 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 rounded-full border border-stone-300/90 bg-[#fafaf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                      aria-hidden
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-5 pt-1 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Feature</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-zinc-900">{title}</h3>
                    <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-zinc-600">{line}</p>

                    {/* Decorative barcode strip */}
                    <div className="mt-6 space-y-2">
                      <div
                        className="h-9 w-full rounded-sm bg-[repeating-linear-gradient(90deg,#18181b_0px,#18181b_2px,transparent_2px,transparent_5px)] opacity-[0.85] mix-blend-multiply"
                        aria-hidden
                      />
                      <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-400 tabular-nums">
                        ◆ SER {884200 + i} ◆ {ticketId.replace(/-/g, '')}
                      </p>
                    </div>
                  </div>
                </article>
              </ChoreoReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — gameday props pipeline (clipboard → radio → headphones) */}
      <section className="border-t border-stone-200/80 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(120,113,108,0.07),transparent_50%),linear-gradient(180deg,#f5f5f4_0%,#e7e5e4_35%,#f5f5f4_100%)] overflow-x-clip">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14 md:py-16 lg:py-20">
          <PlaybookGroupReveal>
            <div className="aw-playbook-headline mb-8 md:mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-zinc-900 text-center leading-[1.05]">
                How it works
              </h2>
              <p className="mt-3 md:mt-4 text-center text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-zinc-500">
                From booth to every seat
              </p>
              <p className="mt-3 text-center text-[11px] text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                Booth run sheet → venue RF → fan listen
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch md:justify-center gap-6 md:gap-0">
              {STEPS.flatMap(({ step, title, line, phase, visual, propLabel }, i) => {
                const card = (
                  <div
                    key={step}
                    className="aw-playbook-card flex-1 min-w-0 w-full max-w-lg mx-auto md:max-w-none"
                    style={{ transitionDelay: `${55 + i * 50}ms` }}
                  >
                    <article className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-stone-300/80 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_12px_36px_-16px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.025)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_20px_48px_-20px_rgba(0,0,0,0.16)]">
                      <div className="relative isolate flex min-h-[10.5rem] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-stone-200/70 via-stone-100/90 to-white px-4 pt-6 pb-5 ring-1 ring-stone-200/60">
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent"
                          aria-hidden
                        />
                        <span className="absolute left-3 top-3 rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-wider text-zinc-600 ring-1 ring-stone-200/80 backdrop-blur-[2px]">
                          {step}
                        </span>
                        <HowItWorksStepArt variant={visual} className="relative z-[1] drop-shadow-sm" />
                        <p className="relative z-[1] mt-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                          {propLabel}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col border-t border-stone-200/90 bg-white px-4 pb-4 pt-3.5 text-left">
                        <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-stone-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-700">
                          {phase}
                        </span>
                        <h3 className="mt-2.5 text-lg md:text-xl font-semibold tracking-tight text-zinc-900 leading-snug">
                          <span className="sr-only">Step {step}. </span>
                          {title}
                        </h3>
                        <p className="mt-2 flex-1 text-xs md:text-sm font-light leading-relaxed text-zinc-600">{line}</p>
                      </div>
                    </article>
                  </div>
                );
                if (i === 0) return [card];
                return [<HowItWorksFlowConnector key={`hiw-conn-${step}`} />, card];
              })}
            </div>
          </PlaybookGroupReveal>
        </div>
      </section>

      {/* Use cases — editorial tiles, four-across on large screens */}
      <section className="border-t border-stone-200/80 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(120,113,108,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#fafaf9_50%,#ffffff_100%)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-20 lg:py-24">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.05]">
                Any live event
              </h2>
              <p className="mt-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-zinc-400">
                Sports · Tours · Festivals
              </p>
              <p className="mt-5 text-zinc-600 font-light text-base md:text-lg leading-relaxed">
                Same in-venue stack—whether it&apos;s kickoff, a boundary, or the encore.
              </p>
            </div>
          </Reveal>
          <ul className="mt-12 md:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 list-none p-0 m-0">
            {USE_CASES.map((item, i) => {
              const from = USE_CASE_ENTRY_FROM[(i * 3 + 1) % 4];
              return (
                <li
                  key={item.title}
                  className="group relative aspect-[10/13] sm:aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 ring-1 ring-stone-200/90 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_16px_40px_-24px_rgba(0,0,0,0.2)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.28)]"
                >
                  <Reveal fadeOnly className="absolute inset-0 h-full w-full min-h-0">
                    <div
                      className={`aw-usecase-drop aw-from-${from} absolute inset-0 h-full w-full`}
                      style={{ '--aw-stagger': i * 72 }}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">{item.tag}</p>
                        <p className="mt-1.5 text-lg sm:text-xl font-semibold tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Product — spotlight showcase */}
      <section className="border-t border-stone-200/80 bg-[radial-gradient(ellipse_85%_55%_at_15%_45%,rgba(120,113,108,0.08),transparent_55%),radial-gradient(ellipse_70%_50%_at_85%_75%,rgba(63,63,70,0.05),transparent_50%),linear-gradient(180deg,#fafaf9_0%,#f5f5f4_45%,#fafaf9_100%)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 md:py-28 lg:py-32">
          <div
            ref={productRevealRef}
            className={`aw-reveal ${productRevealVisible ? 'aw-reveal-visible' : ''}`.trim()}
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
              <div className="relative mx-auto max-w-md lg:mx-0">
                <div
                  className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-zinc-300/25 via-stone-200/20 to-transparent blur-3xl opacity-90"
                  aria-hidden
                />
                <div className="group relative aspect-square overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-white via-stone-50/90 to-stone-100 ring-1 ring-stone-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_28px_64px_-28px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_32px_72px_-32px_rgba(0,0,0,0.18)]">
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_42%,rgba(255,255,255,0.95),transparent_68%)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-x-8 bottom-[18%] h-1/4 rounded-[100%] bg-zinc-900/[0.06] blur-2xl"
                    aria-hidden
                  />
                  <p className="relative z-[1] pt-7 sm:pt-8 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
                    In-venue receiver
                  </p>
                  <div className="relative z-[1] flex h-[calc(100%-4.25rem)] min-h-[200px] items-center justify-center px-8 pb-10 pt-2 sm:px-12">
                    <ProductPixelReveal
                      src="/Earwing.png"
                      alt={PRODUCT_DISPLAY_NAME}
                      enabled={productRevealVisible}
                      onComplete={onProductPixelsComplete}
                      imgClassName="w-full max-w-[240px] sm:max-w-[270px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.16)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>
              <div
                className={`text-center lg:text-left transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  productCopyRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-400">Product</p>
                <h2 className="mt-4 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-[-0.035em] text-zinc-900 leading-[1.08]">
                  {PRODUCT_DISPLAY_NAME}
                </h2>
                <p className="mt-6 text-zinc-600 font-light text-lg sm:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                  Lightweight receiver. Tuned for crowds—not couches.
                </p>
                <ul className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2 gap-y-2.5 text-[13px] text-zinc-600">
                  {['Venue RF', 'Low latency', 'Built for scale'].map((label) => (
                    <li
                      key={label}
                      className="rounded-full border border-stone-200/90 bg-white/70 px-3.5 py-1.5 font-medium text-zinc-700 shadow-sm shadow-stone-200/40 backdrop-blur-sm"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/shop"
                  className="inline-flex mt-10 min-h-[48px] items-center justify-center px-10 rounded-full bg-zinc-900 text-white text-sm font-medium tracking-wide shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-colors duration-300"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — soft, not a black slab */}
      <section className="border-t border-stone-200/80 bg-gradient-to-b from-sky-50/80 to-white">
        <Reveal>
          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-28 md:py-36 lg:py-44 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.08]">
              Ready for your venue?
            </h2>
            <p className="mt-8 text-zinc-600 font-light text-lg max-w-lg mx-auto">
              In-venue audio, engineered for scale.
            </p>
            <Link
              to="/shop"
              className="inline-flex mt-12 min-h-[52px] items-center justify-center px-12 rounded-full bg-zinc-900 text-white text-sm font-medium tracking-wide hover:bg-zinc-800 transition-colors duration-300 shadow-lg shadow-zinc-900/15"
            >
              Get started
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
