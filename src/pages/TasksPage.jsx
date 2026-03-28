import { useState } from 'react'
import { TaskDetailCard } from '../components/TaskDetailCard'
import { tasks as fallbackTasks } from '../data/mock'

function parseDollar(val) {
  return Number(String(val ?? 0).replace(/[^\d.]/g, '')) || 0
}

function claimStatusBadge(status) {
  if (status === 'completed' || status === '\u5df2\u5b8c\u6210') return { label: 'Completed', cls: 'bg-emerald-500' }
  if (status === 'rejected' || status === '\u5df2\u9a73\u56de') return { label: 'Rejected', cls: 'bg-red-500' }
  if (status === 'under_review' || status === '\u5f85\u5ba1\u6838') return { label: 'Reviewing', cls: 'bg-blue-500' }
  return { label: 'Pending', cls: 'bg-amber-500' }
}

export function TasksPage({ platformData, onStartTask, onOpenProfile, submittingTaskId }) {
  const [selectedTask, setSelectedTask] = useState(null)

  const tasks = platformData?.tasks ?? fallbackTasks
  const claimedTasks = platformData?.claimedTasks ?? []
  const claimMap = new Map(claimedTasks.map((item) => [item.taskId, item]))

  const activeRule = platformData?.activeRule ?? null
  const minAmount = activeRule ? parseDollar(activeRule.minAmount) : 0

  const isTaskLocked = (task) => {
    if (!activeRule || minAmount <= 0) return false
    return task.price < minAmount
  }

  const getNextTask = (justClaimedId) => {
    const currentIndex = tasks.findIndex((t) => t.id === justClaimedId)
    for (let i = 1; i <= tasks.length; i++) {
      const next = tasks[(currentIndex + i) % tasks.length]
      if (next.id === justClaimedId) continue
      if (isTaskLocked(next)) continue
      const claim = claimMap.get(next.id)
      if (!claim || claim.status === 'rejected' || claim.status === '\u5df2\u9a73\u56de') return next
    }
    return null
  }

  const selectedClaim = selectedTask ? claimMap.get(selectedTask.id) : null

  const handleStartTask = async (task) => {
    await onStartTask?.(task)
    const next = getNextTask(task.id)
    setSelectedTask(next ?? null)
  }

  // Determine the current task the user should work on:
  // 1. Any task with pending_proof or rejected status (needs action)
  // 2. First unclaimed unlocked task
  // 3. First under_review task (waiting)
  // 4. Fallback to first task
  const currentTask = (() => {
    // Priority 1: task needing user action (pending or rejected)
    const actionNeeded = claimedTasks.find(
      (c) => c.status === '\u5f85\u63d0\u4ea4' || c.status === 'pending_proof' || c.status === '\u5df2\u9a73\u56de' || c.status === 'rejected'
    )
    if (actionNeeded) {
      const t = tasks.find((t) => t.id === actionNeeded.taskId)
      if (t) return t
    }
    // Priority 2: first unlocked unclaimed task
    const unclaimed = tasks.find((t) => {
      if (isTaskLocked(t)) return false
      const c = claimMap.get(t.id)
      return !c || c.status === '\u5df2\u9a73\u56de' || c.status === 'rejected'
    })
    if (unclaimed) return unclaimed
    // Priority 3: under review task
    const reviewing = claimedTasks.find((c) => c.status === '\u5f85\u5ba1\u6838' || c.status === 'under_review')
    if (reviewing) {
      const t = tasks.find((t) => t.id === reviewing.taskId)
      if (t) return t
    }
    // Fallback
    return tasks[0] ?? null
  })()

  const visibleTasks = currentTask ? [currentTask] : []

  return (
    <div className="space-y-4">
      <section>
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-400">Task Hall</p>
        <div className="grid grid-cols-2 gap-3">
          {visibleTasks.map((task) => {
            const claim = claimMap.get(task.id)
            const submitting = submittingTaskId === task.id
            const locked = isTaskLocked(task)
            const alreadyClaimed = Boolean(claim && claim.status !== 'rejected' && claim.status !== '\u5df2\u9a73\u56de')
            const badge = claim ? claimStatusBadge(claim.status) : null

            return (
              <article
                key={task.id}
                className={`overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 ${
                  locked ? 'opacity-60' : 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]'
                }`}
              >
                <button type="button" onClick={() => !locked && setSelectedTask(task)} className="block w-full text-left">
                  <div className="relative overflow-hidden rounded-[22px]">
                    <img src={task.image} alt={task.title} className="h-28 w-full object-cover" />
                    {locked ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] bg-black/50">
                        <span className="text-2xl">🔒</span>
                        <span className="mt-1 text-[10px] font-bold text-white">Min ${minAmount}</span>
                      </div>
                    ) : (
                      <>
                        <span className="absolute left-2 top-2 rounded-full bg-[#f3c969] px-2 py-1 text-[10px] font-bold text-black">{task.badge}</span>
                        {badge && <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold text-white ${badge.cls}`}>{badge.label}</span>}
                      </>
                    )}
                  </div>
                  <div className="px-1 pb-1 pt-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{task.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-base font-bold text-amber-600">${task.price}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{task.location}</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={locked || submitting}
                  onClick={() => !locked && setSelectedTask(task)}
                  className={`mt-2 w-full rounded-2xl px-3 py-2 text-xs font-semibold transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                    locked ? 'bg-slate-200 text-slate-400' : 'bg-black text-white hover:bg-slate-800 disabled:bg-slate-300'
                  }`}
                >
                  {locked ? `Requires Min $${minAmount}`
                    : alreadyClaimed ? 'View Detail'
                    : submitting ? 'Submitting...'
                    : 'Grab Order'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedTask(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-t-[32px] bg-[#f6f7f8] p-4 pb-10 shadow-[0_-20px_60px_rgba(15,23,42,0.18)] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <TaskDetailCard
              task={selectedTask}
              claim={selectedClaim}
              submitting={submittingTaskId === selectedTask.id}
              onStart={handleStartTask}
              onOpenProfile={() => { onOpenProfile?.(); setSelectedTask(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
