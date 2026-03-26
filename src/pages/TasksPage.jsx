import { useMemo, useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { TaskDetailCard } from '../components/TaskDetailCard'
import { taskFilters as fallbackFilters, tasks as fallbackTasks } from '../data/mock'

export function TasksPage({ platformData, onOpenTask, onStartTask, onOpenProfile, submittingTaskId }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const taskFilters = platformData?.taskFilters ?? fallbackFilters
  const tasks = platformData?.tasks ?? fallbackTasks
  const claimMap = new Map((platformData?.claimedTasks ?? []).map((item) => [item.taskId, item]))

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
            const disabled = Boolean(claim && claim.status !== '已驳回') || submitting

            return (
              <article
                key={task.id}
                className="overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
              >
                <button type="button" onClick={() => onOpenTask?.(task)} className="block w-full text-left">
                  <div className="relative overflow-hidden rounded-[22px]">
                    <img src={task.image} alt={task.title} className="h-28 w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-full bg-[#f3c969] px-2 py-1 text-[10px] font-bold text-black">
                      {task.badge}
                    </span>
                    {claim ? (
                      <span
                        className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold text-white ${
                          claim.status === '已完成'
                            ? 'bg-emerald-500'
                            : claim.status === '已驳回'
                              ? 'bg-red-500'
                              : claim.status === '待审核'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                        }`}
                      >
                        {claim.status === '已完成'
                          ? 'Completed'
                          : claim.status === '已驳回'
                            ? 'Rejected'
                            : claim.status === '待审核'
                              ? 'Reviewing'
                              : 'Pending Proof'}
                      </span>
                    ) : null}
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
                  onClick={() => onStartTask?.(task)}
                  className="mt-2 w-full rounded-2xl bg-black px-3 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-slate-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {claim?.status === '已完成'
                    ? 'Completed'
                    : claim?.status === '待审核'
                      ? 'Awaiting Review'
                      : claim?.status === '待提交'
                        ? 'Submit Proof In Profile'
                        : claim?.status === '已驳回'
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
