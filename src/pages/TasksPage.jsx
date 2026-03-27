import { useMemo, useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { TaskDetailCard } from '../components/TaskDetailCard'
import { taskFilters as fallbackFilters, tasks as fallbackTasks } from '../data/mock'

function parseDollar(val) {
  return Number(String(val ?? 0).replace(/[^\d.]/g, '')) || 0
}

export function TasksPage({ platformData, onOpenTask, onStartTask, onOpenProfile, submittingTaskId }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const taskFilters = platformData?.taskFilters ?? fallbackFilters
  const tasks = platformData?.tasks ?? fallbackTasks
  const claimMap = new Map((platformData?.claimedTasks ?? []).map((item) => [item.taskId, item]))

  // Rule-based lock
  const activeRule = platformData?.activeRule ?? null
  const vipLevel = platformData?.vipLevel ?? 'VIP1'
  const minAmount = activeRule ? parseDollar(activeRule.minAmount) : 0

  const isTaskLocked = (task) => {
    if (!activeRule || minAmount <= 0) return false
    return task.price < minAmount
  }

  const visibleTasks = useMemo(() => {
    if (activeFilter === 'All') return tasks
    if (activeFilter === 'High Pay') return tasks.filter((task) => task.price >= 100)
    if (activeFilter === 'Easy') return tasks.filter((task) => task.type === 'Easy' || task.price <= 30)
    if (activeFilter === 'Nearby') return tasks.filter((task) => task.type === 'Nearby')
    return tasks
  }, [activeFilter, tasks])

  const featuredTask = visibleTasks[0] ?? tasks[0]
  const featuredClaim = featuredTask ? claimMap.get(featuredTask.id) : null

  return (
    <div className="space-y-5">
      {activeRule && minAmount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">{vipLevel} Rule Active</p>
          <p className="mt-1 text-xs text-amber-600">
            Your current level requires tasks with a minimum reward of <span className="font-bold">${minAmount}</span>. Tasks below this threshold are locked.
          </p>
        </div>
      )}

      <section>
        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {taskFilters.map((filter) => {
            const active = filter === activeFilter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  active
                    ? 'bg-black text-[#f3c969] shadow-[0_10px_24px_rgba(0,0,0,0.18)]'
                    : 'bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Task Hall" title="Hot Picks" />
        <div className="grid grid-cols-2 gap-3">
          {visibleTasks.map((task) => {
            const claim = claimMap.get(task.id)
            const submitting = submittingTaskId === task.id
            const locked = isTaskLocked(task)
            const disabled = locked || Boolean(claim && claim.status !== '已驳回' && claim.status !== 'rejected') || submitting

            return (
              <article
                key={task.id}
                className={`overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 ${
                  locked ? 'opacity-60' : 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]'
                }`}
              >
                <button type="button" onClick={() => !locked && onOpenTask?.(task)} className="block w-full text-left">
                  <div className="relative overflow-hidden rounded-[22px]">
                    <img src={task.image} alt={task.title} className="h-28 w-full object-cover" />
                    {locked ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] bg-black/50">
                        <span className="text-2xl">🔒</span>
                        <span className="mt-1 text-[10px] font-bold text-white">Min ${minAmount}</span>
                      </div>
                    ) : (
                      <>
                        <span className="absolute left-2 top-2 rounded-full bg-[#f3c969] px-2 py-1 text-[10px] font-bold text-black">
                          {task.badge}
                        </span>
                        {claim ? (
                          <span
                            className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold text-white ${
                              claim.status === '已完成' || claim.status === 'completed'
                                ? 'bg-emerald-500'
                                : claim.status === '已驳回' || claim.status === 'rejected'
                                  ? 'bg-red-500'
                                  : claim.status === '待审核' || claim.status === 'under_review'
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                            }`}
                          >
                            {claim.status === '已完成' || claim.status === 'completed'
                              ? 'Completed'
                              : claim.status === '已驳回' || claim.status === 'rejected'
                                ? 'Rejected'
                                : claim.status === '待审核' || claim.status === 'under_review'
                                  ? 'Reviewing'
                                  : 'Pending Proof'}
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className="px-1 pb-1 pt-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{task.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-base font-bold text-amber-600">${task.price}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                        {task.location}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !locked && onStartTask?.(task)}
                  className={`mt-2 w-full rounded-2xl px-3 py-2 text-xs font-semibold transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                    locked
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-black text-white hover:bg-slate-800 disabled:bg-slate-300'
                  }`}
                >
                  {locked
                    ? `Requires Min $${minAmount}`
                    : claim?.status === '已完成' || claim?.status === 'completed'
                      ? 'Completed'
                      : claim?.status === '待审核' || claim?.status === 'under_review'
                        ? 'Awaiting Review'
                        : claim?.status === '待提交' || claim?.status === 'pending_proof'
                          ? 'Submit Proof In Profile'
                          : claim?.status === '已驳回' || claim?.status === 'rejected'
                            ? 'Claim Again'
                            : submitting
                              ? 'Submitting...'
                              : 'Grab Order'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Detail" title="Task Detail" />
        <TaskDetailCard
          task={featuredTask}
          claim={featuredClaim}
          submitting={featuredTask ? submittingTaskId === featuredTask.id : false}
          onStart={onStartTask}
          onOpenProfile={onOpenProfile}
        />
      </section>
    </div>
  )
}
