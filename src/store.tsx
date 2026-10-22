import { useContext, useEffect, useState, type ReactNode } from 'react'
import { StoreCtx } from './storeContext'

export type Role = 'tenant' | 'landlord'
export type User = { id: string; name: string; email: string; password: string; role: Role }
export type DocStatus = 'locked' | 'requested' | 'granted'
export type Doc = {
  id: string
  ownerId: string
  title: string
  category: string
  content: string
  image?: string
  status: DocStatus
  reason?: string
  expiresAt?: number
}
type State = {
  users: User[]
  sessionId: string | null
  paid: Record<string, number>
  released: boolean
  docs: Doc[]
}

export const RENT_PER_TENANT = 160
export const FLAT = {
  name: 'Flat 3B, Sunrise City',
  area: 'District 7, Ho Chi Minh City',
  lease: '01 Nov 2025 – 31 Oct 2026',
}
const HOUR = 3_600_000

const seed = (): State => {
  const now = Date.now()
  return {
    users: [
      { id: 'minh', name: 'Minh Nguyen', email: 'minh@demo.com', password: 'demo1234', role: 'tenant' },
      { id: 'lan', name: 'Lan Tran', email: 'lan@demo.com', password: 'demo1234', role: 'tenant' },
      { id: 'tuan', name: 'Tuan Le', email: 'tuan@demo.com', password: 'demo1234', role: 'tenant' },
      { id: 'bay', name: 'Mr. Bay', email: 'landlord@demo.com', password: 'demo1234', role: 'landlord' },
    ],
    sessionId: null,
    paid: { minh: now - 21 * 24 * HOUR, lan: now - 21 * 24 * HOUR, tuan: now - 20 * 24 * HOUR },
    released: false,
    docs: [
      {
        id: 'd1',
        ownerId: 'minh',
        title: 'National ID card',
        category: 'ID',
        content: 'ID 079 090 •••• 214 · NGUYEN QUANG MINH · Born 14/03/1996',
        status: 'requested',
        reason: 'Temporary residence registration at Tan Hung Ward police',
      },
      {
        id: 'd2',
        ownerId: 'lan',
        title: 'Marriage certificate',
        category: 'Identity',
        content: 'Certificate No. 118/2023 · TRAN THI LAN',
        status: 'locked',
      },
      {
        id: 'd3',
        ownerId: 'lan',
        title: 'Payslips (3 months)',
        category: 'Income',
        content: 'Net income avg. $1,140 / month · Employer: Saigon Tech JSC',
        status: 'locked',
      },
      {
        id: 'd4',
        ownerId: 'tuan',
        title: 'Student confirmation',
        category: 'Study',
        content: 'RMIT ID s3984120 · LE HOANG TUAN · Software Engineering · valid to 2027',
        status: 'granted',
        reason: 'Student discount on building fees',
        expiresAt: now + 23.5 * HOUR,
      },
    ],
  }
}

const KEY = 'rentease-v1'
const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* ignore corrupt storage */
  }
  return seed()
}

export type Ctx = {
  state: State
  me: User | null
  now: number
  signIn: (email: string, password: string) => string | null
  signUp: (name: string, email: string, password: string) => string | null
  signOut: () => void
  resetDemo: () => void
  pay: () => void
  release: () => void
  addDoc: (title: string, category: string, content: string, image?: string) => void
  requestAccess: (id: string, reason: string) => void
  approve: (id: string) => void
  deny: (id: string) => void
  revoke: (id: string) => void
}


export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [now, setNow] = useState(Date.now())

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state])
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // auto-revoke expired grants
  useEffect(() => {
    if (state.docs.some((d) => d.status === 'granted' && d.expiresAt && d.expiresAt <= now)) {
      setState((s) => ({
        ...s,
        docs: s.docs.map((d) =>
          d.status === 'granted' && d.expiresAt && d.expiresAt <= now
            ? { ...d, status: 'locked', expiresAt: undefined, reason: undefined }
            : d,
        ),
      }))
    }
  }, [now, state.docs])

  const me = state.users.find((u) => u.id === state.sessionId) ?? null
  const patchDoc = (id: string, p: Partial<Doc>) =>
    setState((s) => ({ ...s, docs: s.docs.map((d) => (d.id === id ? { ...d, ...p } : d)) }))

  const value: Ctx = {
    state,
    me,
    now,
    signIn: (email, password) => {
      const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
      if (!u || u.password !== password) return 'Incorrect email or password.'
      setState((s) => ({ ...s, sessionId: u.id }))
      return null
    },
    signUp: (name, email, password) => {
      if (!name.trim()) return 'Please enter your name.'
      if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email.'
      if (password.length < 6) return 'Password must be at least 6 characters.'
      if (state.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase()))
        return 'An account with this email already exists.'
      const u: User = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'tenant',
      }
      setState((s) => ({ ...s, users: [...s.users, u], sessionId: u.id }))
      return null
    },
    signOut: () => setState((s) => ({ ...s, sessionId: null })),
    resetDemo: () => setState(seed()),
    pay: () => me && setState((s) => ({ ...s, paid: { ...s.paid, [me.id]: Date.now() }, released: false })),
    release: () => setState((s) => ({ ...s, released: true })),
    addDoc: (title, category, content, image) =>
      me &&
      setState((s) => ({
        ...s,
        docs: [
          { id: crypto.randomUUID(), ownerId: me.id, title, category, content, image, status: 'locked' },
          ...s.docs,
        ],
      })),
    requestAccess: (id, reason) => patchDoc(id, { status: 'requested', reason }),
    approve: (id) => patchDoc(id, { status: 'granted', expiresAt: Date.now() + 24 * HOUR }),
    deny: (id) => patchDoc(id, { status: 'locked', reason: undefined }),
    revoke: (id) => patchDoc(id, { status: 'locked', expiresAt: undefined, reason: undefined }),
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore outside provider')
  return c
}

export const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
export const countdown = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`
}
