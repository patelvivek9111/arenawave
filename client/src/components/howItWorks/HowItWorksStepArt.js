import React from 'react';

const stroke = {
  board: 'stroke-zinc-500',
  soft: 'stroke-zinc-400',
};

/** Gameday ops pipeline: booth sheet → comms radio → fan audio */
export function HowItWorksStepArt({ variant, className = '' }) {
  const common = `max-h-[9.5rem] w-auto ${className}`;

  if (variant === 'clipboard') {
    return (
      <svg className={common} viewBox="0 0 120 130" fill="none" aria-hidden>
        <title>Clipboard</title>
        <rect x="28" y="18" width="64" height="98" rx="5" className={`${stroke.board} stroke-[1.35]`} fill="rgba(255,255,255,0.65)" />
        <path
          d="M48 18v-6c0-3.3 2.7-6 6-6h12c3.3 0 6 2.7 6 6v6"
          className={`${stroke.board} stroke-[1.35]`}
          strokeLinecap="round"
        />
        <rect x="54" y="6" width="12" height="10" rx="2" className={`${stroke.soft} stroke-[1.2]`} fill="rgba(244,244,245,0.9)" />
        <rect x="36" y="32" width="48" height="76" rx="3" className={`${stroke.soft} stroke-[1.1]`} fill="white" />
        <line x1="42" y1="44" x2="78" y2="44" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" />
        <line x1="42" y1="56" x2="74" y2="56" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" />
        <line x1="42" y1="68" x2="76" y2="68" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" />
        <line x1="42" y1="80" x2="58" y2="80" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" />
        <circle cx="60" cy="98" r="3" className={`${stroke.board} stroke-[1.2]`} fill="rgba(228,228,231,0.5)" />
      </svg>
    );
  }

  if (variant === 'radio') {
    return (
      <svg className={common} viewBox="0 0 120 130" fill="none" aria-hidden>
        <title>Handheld radio</title>
        <path d="M58 10v22" className={`${stroke.board} stroke-[1.5]`} strokeLinecap="round" />
        <circle cx="58" cy="8" r="2.5" className={`${stroke.board} stroke-[1.2]`} fill="rgba(228,228,231,0.6)" />
        <rect x="32" y="30" width="56" height="82" rx="8" className={`${stroke.board} stroke-[1.35]`} fill="rgba(255,255,255,0.7)" />
        <rect x="40" y="40" width="40" height="22" rx="3" className={`${stroke.soft} stroke-[1.1]`} fill="rgba(24,24,27,0.06)" />
        <line x1="44" y1="48" x2="68" y2="48" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" opacity="0.7" />
        <line x1="44" y1="54" x2="62" y2="54" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" opacity="0.5" />
        <circle cx="48" cy="78" r="3" className={`${stroke.board} stroke-[1.1]`} fill="rgba(244,244,245,0.9)" />
        <circle cx="60" cy="78" r="3" className={`${stroke.board} stroke-[1.1]`} fill="rgba(228,228,231,0.5)" />
        <circle cx="72" cy="78" r="3" className={`${stroke.board} stroke-[1.1]`} fill="rgba(228,228,231,0.5)" />
        <path
          d="M44 94h32M44 100h24"
          className={`${stroke.soft} stroke-[1.1]`}
          strokeLinecap="round"
          opacity="0.85"
        />
        <rect x="46" y="68" width="28" height="14" rx="2" className={`${stroke.soft} stroke-[1]`} fill="rgba(244,244,245,0.95)" />
      </svg>
    );
  }

  // headphones
  return (
    <svg className={common} viewBox="0 0 120 130" fill="none" aria-hidden>
      <title>Headphones</title>
      <path
        d="M28 78c0-22 16-38 32-38s32 16 32 38"
        className={`${stroke.board} stroke-[1.45]`}
        strokeLinecap="round"
      />
      <rect x="18" y="72" width="22" height="44" rx="9" className={`${stroke.board} stroke-[1.35]`} fill="rgba(255,255,255,0.75)" />
      <rect x="80" y="72" width="22" height="44" rx="9" className={`${stroke.board} stroke-[1.35]`} fill="rgba(255,255,255,0.75)" />
      <path d="M28 88v20" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" opacity="0.6" />
      <path d="M92 88v20" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" opacity="0.6" />
      <path
        d="M52 108c4 6 12 6 16 0"
        className={`${stroke.soft} stroke-[1.1]`}
        strokeLinecap="round"
        opacity="0.75"
      />
      <path d="M40 46c6-10 16-16 28-16s22 6 28 16" className={`${stroke.soft} stroke-[1]`} strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function HowItWorksFlowConnector() {
  return (
    <div
      className="hidden md:flex flex-none flex-col items-center justify-center w-8 lg:w-10 self-stretch py-8"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-1 text-zinc-400">
        <div className="h-px w-6 bg-gradient-to-r from-transparent via-zinc-300 to-zinc-300" />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-400">
          <path
            d="M6 10h8m-3-3 3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="h-px w-6 bg-gradient-to-r from-zinc-300 via-zinc-300 to-transparent" />
      </div>
    </div>
  );
}
