const fallbackMenus = ['Withdrawal Records', 'Task Records', 'Real-Name Verification', 'Security Center']

function statusClass(status) {
  if (status === '已完成' || status === 'completed') return 'bg-emerald-50 text-emerald-600'
  if (status === '已驳回' || status === 'rejected') return 'bg-red-50 text-red-600'
  if (status === '待审核' || status === 'under_review') return 'bg-blue-50 text-blue-600'
  return 'bg-amber-50 text-amber-600'
}

function statusLabel(status) {
  if (status === '已完成' || status === 'completed') return 'Completed'
  if (status === '已驳回' || status === 'rejected') return 'Rejected'
  if (status === '待审核' || status === 'under_review') return 'Reviewing'
  return 'Pending Proof'
}

export function ProfilePage({
  platformData,
  onMenuClick,
  onQuickAction,
  onLogout,
}) {
  const profile = platformData?.profile ?? {
    name: 'Premium Member · Aurora',
    subtitle: 'Active for 29 days in a row',
    stats: [],
    menus: fallbackMenus,
  }
  const claimedTasks = platformData?.claimedTasks ?? []
  const pendingTasks = claimedTasks.filter((task) => task.status === '待提交' || task.status === 'pending_proof').length
  const reviewingTasks = claimedTasks.filter((task) => task.status === '待审核' || task.status === 'under_review').length
  const rejectedTasks = claimedTasks.filter((task) => task.status === '已驳回' || task.status === 'rejected').length

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuickAction?.('profile-card')}
            className="h-14 w-14 rounded-[20px] bg-gradient-to-br from-[#f3c969] to-[#d4a64f]"
            aria-label="profile card"
          />
          <div>
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-white/60">{profile.subtitle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {profile.stats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAction?.(item.label)}
              className="rounded-3xl bg-white/8 p-3 text-center transition hover:bg-white/12 active:scale-[0.98]"
            >
              <p className="text-[11px] text-white/50">{item.label}</p>
              <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Pending Proof</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingTasks}</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Under Review</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{reviewingTasks}</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{rejectedTasks}</p>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">My Tasks</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Task Records</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {claimedTasks.length} records
          </span>
        </div>
        {claimedTasks.length ? (
          <div className="space-y-2">
            {claimedTasks.slice(0, 20).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-2.5">
                <p className="flex-1 truncate text-sm font-medium text-slate-800">{task.title}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No task records yet. Go to the Task Hall and claim your first task.
          </div>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        {(profile.menus ?? fallbackMenus).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onMenuClick?.(item)}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <span>{item}</span>
            <span className="text-slate-300">›</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onLogout?.()}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-red-500 transition hover:bg-red-50 active:scale-[0.99]"
        >
          <span>Log Out</span>
          <span className="text-red-300">›</span>
        </button>
      </section>
    </div>
  )
}
