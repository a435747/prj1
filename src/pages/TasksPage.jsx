import { useState } from 'react'
import { TaskDetailCard } from '../components/TaskDetailCard'
import { tasks as fallbackTasks } from '../data/mock'

function parseDollar(val) {
  return Number(String(val ?? 0).replace(/[^\d.]/g, '')) || 0
}

function claimStatusBadge(status) {
  if (status === '已完成' || status === 'completed') return { label: 'Completed', cls: 'bg-emerald-500' }
  if (status === '已驳回' || status === 'rejected') return { label: 'Rejected', cls: 'bg-red-500' }
  if (status === '待审核' || status === 'under_review') return { label: 'Reviewing', cls: 'bg-blue-500' }
  return { label: 'Pending', cls: 'bg-amber-500' }
}

export function TasksPage({ platformData, onStartTask, onOpenProfile, submittingTaskId }) {
  const [selectedTask, setSelectedTask] = useState(null)

  const tasks = platformData?.tasks ?? fallbackTasks
  const claimedTasks = platformData?.claimedTasks ?? []
  const claimMap = new Map(claimedTasks.map((item) => [item.taskId, item]))

  const activeRule = platformData?.activeRule ?? null
  const vipLevel = platformData?.vipLevel ?? 'VIP1'
  const minAmount = activeRule ? parseDollar(activeRule.minAmount) : 0
  const taskGroupCount = Number(activeRule?.taskGroupCount ?? 0)

  const isTaskLocked = (task) => {
    if (!activeRule || minAmount <= 0) return false
    return task.price < minAmount
  }

  const completedCount = claimedTasks.filter(
    (c) => c.status === '已完成' || c.status === 'completed',
  ).length
  const groupProgress = taskGroupCount > 0 ? completedCount % taskGroupCount : null
  const groupTotal = taskGroupCount > 0 ? taskGroupCount : null

  const getNextTask = (justClaimedId) => {
    const currentIndex = tasks.findIndex((t) => t.id === justClaimedId)
    for (let i = 1; i <= tasks.length; i++) {
      const next = tasks[(currentIndex + i) % tasks.length]
      if (next.id === justClaimedId) continue
      if (isTaskLocked(next)) continue
      const claim = claimMap.get(next.id)
      if (!claim || claim.status === '已驳回' || claim.status === 'rejected') return next
    }
    return null
  }

  const selectedClaim = selectedTask ? claimMap.get(selectedTask.id) : null

  const handleStartTask = async (task) => {
    await onStartTask?.(task)
    const next = getNextTask(task.id)
    setSelectedTask(next ?? null)
  }

  return (
    <div className="space-y-4">
      {/* Rule info + group progress */}
      {activeRule && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-700">{vipLevel} · {activeRule.name}</p>
              {minAmount > 0 && (
                <p className="mt-0.5 text-xs text-amber-600">Min task reward: <span className="font-bold">${minAmount}</span></p>
              )}
            </div>
            {groupTotal > 0 && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500">Group Progress</p>
                <p className="text-lg font-bold text-amber-700">{groupProgress} / {groupTotal}</p>
              </div>
            )}
          </div>
          {groupTotal > 0 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (groupProgress / groupTotal) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Task grid */}
      <section>
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-400">Task Hall</p>
        <div className="grid grid-cols-2 gap-3">
          {tasks.map((task) => {
            const claim = claimMap.get(task.id)
            const submitting = submittingTaskId === task.id
            const locked = isTaskLocked(task)
            const alreadyClaimed = Boolean(claim && claim.status !== '已驳回' && claim.status !== 'rejected')
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
                    : alreadyClaimed && claim.status !== '已驳回' && claim.status !== 'rejected' ? 'View Detail'
                    : submitting ? 'Submitting...'
                    : 'Grab Order'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {/* Task Detail Sheet */}
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
