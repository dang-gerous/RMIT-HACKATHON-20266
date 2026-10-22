import { useStore, usd, RENT_PER_TENANT, FLAT } from '../store'
import { Avatar, Badge, Card, btnPrimary, btnSun } from './ui'

export default function RentView() {
  const { state, me, pay, release } = useStore()
  const tenants = state.users.filter((u) => u.role === 'tenant')
  const paidCount = tenants.filter((t) => state.paid[t.id]).length
  const total = tenants.length * RENT_PER_TENANT
  const collected = paidCount * RENT_PER_TENANT
  const pct = Math.round((collected / total) * 100)
  const isLandlord = me?.role === 'landlord'
  const myPaid = me ? !!state.paid[me.id] : false

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-soft">Rent collected this month</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {usd(collected)}
              <span className="text-xl font-semibold text-ink-soft"> / {usd(total)}</span>
            </p>
          </div>
          <Badge tone={pct === 100 ? 'blue' : 'yellow'}>
            {paidCount} of {tenants.length} paid
          </Badge>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          Payments are held securely. No single person can withdraw the whole pot — the landlord only receives the rent due under the lease.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          {isLandlord ? (
            state.released ? (
              <Badge tone="blue">Rent released to you</Badge>
            ) : (
              <>
                <button className={btnSun} disabled={collected === 0} onClick={release}>
                  Release {usd(collected)}
                </button>
                {paidCount < tenants.length && (
                  <span className="text-sm text-ink-soft">Some tenants haven't paid yet.</span>
                )}
              </>
            )
          ) : myPaid ? (
            <Badge tone="blue">Your share is paid</Badge>
          ) : (
            <button className={btnPrimary} onClick={pay}>
              Pay my share · {usd(RENT_PER_TENANT)}
            </button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Tenants</h2>
        <p className="text-sm text-ink-soft">
          {FLAT.name} · {FLAT.lease}
        </p>
        <ul className="mt-4 divide-y divide-line">
          {tenants.map((t) => {
            const at = state.paid[t.id]
            return (
              <li key={t.id} className="flex items-center gap-4 py-3.5">
                <Avatar name={t.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {t.name} {t.id === me?.id && <span className="text-ink-soft">(you)</span>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {at ? `Paid ${new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Awaiting payment'}
                  </p>
                </div>
                <span className="hidden font-semibold sm:block">{usd(RENT_PER_TENANT)}</span>
                <Badge tone={at ? 'blue' : 'yellow'}>{at ? 'Paid' : 'Due'}</Badge>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
