import { useState, type FormEvent } from 'react'
import { useStore, FLAT } from '../store'
import { Logo } from './ui'

const DEMOS = [
  { label: 'Tenant', email: 'minh@demo.com' },
  { label: 'Landlord', email: 'landlord@demo.com' },
]

export default function Login() {
  const { signIn, signUp, resetDemo } = useStore()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(mode === 'in' ? signIn(email, password) : signUp(name, email, password))
  }

  const field =
    'w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100'

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-600 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <p className="mb-4 inline-block rounded-full bg-sun-400 px-3 py-1 text-sm font-semibold text-ink">
            {FLAT.name}
          </p>
          <h1 className="max-w-md text-5xl leading-[1.1] font-extrabold tracking-tight">
            Rent made simple, and private.
          </h1>
          <p className="mt-5 max-w-sm text-lg text-brand-100">
            Pay your share, track the flat, and decide who sees your documents and for how long.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-sun-400/90" />
        <div className="pointer-events-none absolute right-24 -bottom-10 size-40 rounded-full bg-brand-500" />
        <p className="relative text-sm text-brand-100">{FLAT.area}</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {mode === 'in' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-ink-soft">
            {mode === 'in' ? 'Sign in to manage your rental.' : 'Join your flat as a tenant.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {mode === 'up' && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Full name</span>
                <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email</span>
              <input
                className={field}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Password</span>
              <input
                className={field}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-sun-100 px-4 py-3 text-sm font-medium text-ink">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white transition hover:bg-brand-700 active:scale-[0.99]"
            >
              {mode === 'in' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {mode === 'in' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="font-bold text-brand-600 hover:underline"
              onClick={() => {
                setMode(mode === 'in' ? 'up' : 'in')
                setError(null)
              }}
            >
              {mode === 'in' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {mode === 'in' && (
            <div className="mt-10 rounded-2xl border border-dashed border-line p-4">
              <p className="text-sm font-semibold">Try a demo account</p>
              <p className="mt-0.5 text-xs text-ink-soft">Password for all demos: demo1234</p>
              <div className="mt-3 flex gap-2">
                {DEMOS.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => {
                      setEmail(d.email)
                      setPassword('demo1234')
                      setError(null)
                    }}
                    className="rounded-full bg-sun-100 px-4 py-1.5 text-sm font-semibold transition hover:bg-sun-400"
                  >
                    {d.label}
                  </button>
                ))}
                <button onClick={resetDemo} className="ml-auto text-xs text-ink-soft underline">
                  Reset data
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
