import type { ReactNode } from 'react'
import { initials } from '../store'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-sun-400 text-ink">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>RentEase</span>
    </div>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 ${
        size === 'lg' ? 'size-12 text-base' : 'size-10 text-sm'
      }`}
    >
      {initials(name)}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</section>
}

export function Badge({ tone, children }: { tone: 'blue' | 'yellow' | 'gray'; children: ReactNode }) {
  const t = {
    blue: 'bg-brand-50 text-brand-700',
    yellow: 'bg-sun-100 text-ink',
    gray: 'bg-canvas text-ink-soft',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${t}`}>{children}</span>
}

export const btnPrimary =
  'rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft'
export const btnSun =
  'rounded-xl bg-sun-400 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-sun-500 active:scale-[0.99]'
export const btnGhost =
  'rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-canvas'
