const VIP_LEVELS = [
  {
    level: 'VIP 1',
    color: 'from-slate-500 to-slate-600',
    accent: 'text-slate-300',
    border: 'border-slate-400/30',
    requirement: 'Complete 5 tasks',
    withdrawLimit: '$500 / day',
    commission: 'Standard rate',
    perks: ['Access to all standard tasks', 'Daily withdrawal up to $500', 'Standard commission rate', 'Priority customer support'],
  },
  {
    level: 'VIP 2',
    color: 'from-blue-600 to-blue-700',
    accent: 'text-blue-200',
    border: 'border-blue-400/30',
    requirement: 'Complete 20 tasks',
    withdrawLimit: '$2,000 / day',
    commission: '+5% bonus',
    perks: ['All VIP 1 benefits', 'Daily withdrawal up to $2,000', '+5% commission on every task', 'Early access to new high-pay tasks', 'Dedicated support channel'],
  },
  {
    level: 'VIP 3',
    color: 'from-amber-500 to-yellow-600',
    accent: 'text-yellow-200',
    border: 'border-yellow-400/30',
    requirement: 'Complete 50 tasks',
    withdrawLimit: '$5,000 / day',
    commission: '+12% bonus',
    perks: ['All VIP 2 benefits', 'Daily withdrawal up to $5,000', '+12% commission on every task', 'Exclusive high-commission task pool', 'Instant withdrawal processing', 'Personal account manager'],
  },
]

const HOW_TO = [
  'Complete approved tasks to accumulate your earnings record.',
  'Once you reach the required task count, your VIP level upgrades automatically.',
  'Higher VIP levels unlock larger daily withdrawal limits and bonus commissions.',
  'Contact customer service if your level has not updated after meeting the requirement.',
]

export function VipPage({ frontendUser }) {
  const completedCount = (frontendUser?.platformData?.claimedTasks ?? []).filter(
    (t) => t.status === 'completed' || t.status === '已完成',
  ).length

  const currentLevel =
    completedCount >= 50 ? 2 : completedCount >= 20 ? 1 : 0

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <section className="rounded-[24px] bg-gradient-to-br from-amber-500 to-yellow-600 p-5 text-white shadow-[0_18px_40px_rgba(245,158,11,0.3)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Membership</p>
        <h4 className="mt-2 text-2xl font-semibold">VIP Access</h4>
        <p className="mt-2 text-sm text-white/85">Unlock higher withdrawal limits and bonus commissions by completing more tasks.</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/15 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg">✦</div>
          <div>
            <p className="text-xs text-white/70">Current Level</p>
            <p className="text-lg font-bold">{VIP_LEVELS[currentLevel].level}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-white/70">Tasks Completed</p>
            <p className="text-lg font-bold">{completedCount}</p>
          </div>
        </div>
      </section>

      {/* VIP level cards */}
      <div className="space-y-3">
        {VIP_LEVELS.map((vip, index) => {
          const isActive = index === currentLevel
          const isUnlocked = index <= currentLevel
          return (
            <div
              key={vip.level}
              className={`rounded-[20px] border p-4 transition ${
                isActive
                  ? `bg-gradient-to-br ${vip.color} ${vip.border} shadow-[0_12px_30px_rgba(0,0,0,0.15)]`
                  : isUnlocked
                    ? 'border-emerald-100 bg-emerald-50'
                    : 'border-slate-100 bg-white opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-lg font-bold ${ isActive ? 'text-white' : isUnlocked ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {vip.level}
                  </p>
                  <p className={`mt-0.5 text-xs ${ isActive ? 'text-white/70' : 'text-slate-400'}`}>
                    Requires: {vip.requirement}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive ? 'bg-white/20 text-white' : isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isActive ? 'Current' : isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className={`mt-3 grid grid-cols-2 gap-2 rounded-xl p-3 ${ isActive ? 'bg-white/10' : 'bg-slate-50'}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider ${ isActive ? 'text-white/60' : 'text-slate-400'}`}>Withdraw Limit</p>
                  <p className={`mt-1 text-sm font-semibold ${ isActive ? 'text-white' : 'text-slate-700'}`}>{vip.withdrawLimit}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider ${ isActive ? 'text-white/60' : 'text-slate-400'}`}>Commission</p>
                  <p className={`mt-1 text-sm font-semibold ${ isActive ? 'text-white' : 'text-slate-700'}`}>{vip.commission}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {vip.perks.map((perk) => (
                  <li key={perk} className={`flex items-start gap-2 text-xs ${ isActive ? 'text-white/85' : isUnlocked ? 'text-emerald-700' : 'text-slate-500'}`}>
                    <span className="mt-0.5 shrink-0">{isUnlocked ? '✓' : '○'}</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* How to upgrade */}
      <section className="rounded-[20px] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">How to Upgrade</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">VIP Upgrade Guide</h3>
        <ul className="mt-3 space-y-2">
          {HOW_TO.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-500">{i + 1}</span>
              <span className="leading-6">{line}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
