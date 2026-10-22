import { useState } from 'react'
import { StoreProvider, useStore, FLAT } from './store'
import Login from './components/Login'
import RentView from './components/RentView'
import DocsView from './components/DocsView'
import { Avatar, Logo } from './components/ui'

function Shell() {
  const { me, state, signOut } = useStore()
  const [tab, setTab] = useState<'rent' | 'docs'>('rent')
  if (!me) return <Login />

  const pending = state.docs.filter((d) => d.status === 'requested' && d.ownerId === me.id).length
  const tabs = [
    { id: 'rent' as const, label: 'Rent', badge: 0 },
    { id: 'docs' as const, label: 'Documents', badge: pending },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-bold">{me.name}</p>
              <p className="text-xs text-ink-soft capitalize">{me.role}</p>
            </div>
            <Avatar name={me.name} />
            <button onClick={signOut} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-canvas hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm font-semibold text-brand-600">{FLAT.area}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{FLAT.name}</h1>

        <nav className="mt-6 mb-6 inline-flex rounded-xl bg-white p-1 ring-1 ring-line" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative rounded-lg px-5 py-2 text-sm font-bold transition ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="ml-2 inline-grid size-5 place-items-center rounded-full bg-sun-400 text-xs font-extrabold text-ink">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {tab === 'rent' ? <RentView /> : <DocsView />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
