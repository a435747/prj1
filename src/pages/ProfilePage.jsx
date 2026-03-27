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
  onSubmitProof,
  proofSubmittingId,
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

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Pending Proof</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingTasks}</p>
          <p className="mt-1 text-sm text-slate-500">Tasks waiting for your proof submission.</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Under Review</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{reviewingTasks}</p>
          <p className="mt-1 text-sm text-slate-500">Records currently being reviewed by the platform.</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Need Resubmission</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{rejectedTasks}</p>
          <p className="mt-1 text-sm text-slate-500">Rejected tasks that require updated proof.</p>
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
          <div className="space-y-3">
            {claimedTasks.slice(0, 6).map((task) => {
              const canSubmit = task.status === '待提交' || task.status === 'pending_proof' || task.status === '已驳回' || task.status === 'rejected'
              const isSubmitting = proofSubmittingId === task.id

              return (
                <div key={task.id} className="rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-400">Claimed at: {task.createdAt}</p>
                      {task.submittedAt ? <p className="mt-1 text-xs text-slate-400">Submitted at: {task.submittedAt}</p> : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(task.status)}`}>
                      {statusLabel(task.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">{task.summary}</p>

                  {task.reviewedAt ? (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Review Time</p>
                      <p className="mt-2 leading-6">{task.reviewedAt}</p>
                    </div>
                  ) : null}

                  {task.proofText ? (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Submitted Proof</p>
                      <p className="mt-2 leading-6">{task.proofText}</p>
                    </div>
                  ) : null}

                  {canSubmit ? (
                    <form
                      className="mt-3 space-y-3"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        const formData = new FormData(event.currentTarget)
                        const proofText = String(formData.get('proofText') || '')
                        if (!proofText.trim()) return
                        await onSubmitProof?.(task.id, proofText)
                        event.currentTarget.reset()
                      }}
                    >
                      <textarea
                        name="proofText"
                        rows={3}
                        placeholder="Describe how you completed the task, such as uploaded video link, screenshot ID, or steps finished."
                        defaultValue={task.status === '已驳回' || task.status === 'rejected' ? task.proofText : ''}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {isSubmitting ? 'Submitting...' : task.status === '已驳回' || task.status === 'rejected' ? 'Resubmit Proof' : 'Submit Proof'}
                      </button>
                    </form>
                  ) : null}
                </div>
              )
            })}
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
