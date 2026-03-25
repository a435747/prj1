import { useMemo, useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { TaskDetailCard } from '../components/TaskDetailCard'
import { taskFilters as fallbackFilters, tasks as fallbackTasks } from '../data/mock'

export function TasksPage({ platformData }) {
  const [activeFilter, setActiveFilter] = useState('全部')
  const taskFilters = platformData?.taskFilters ?? fallbackFilters
  const tasks = platformData?.tasks ?? fallbackTasks

  const visibleTasks = useMemo(() => {
    if (activeFilter === '全部') return tasks
    if (activeFilter === '高价') return tasks.filter((task) => task.price >= 100)
    if (activeFilter === '简单') return tasks.filter((task) => task.type === '简单' || task.price <= 30)
    if (activeFilter === '附近') return tasks.filter((task) => task.type === '附近')
    return tasks
  }, [activeFilter, tasks])

  const featuredTask = visibleTasks[0] ?? tasks[0]

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
        <SectionTitle eyebrow="Task Hall" title="热门抢单" />
        <div className="grid grid-cols-2 gap-3">
          {visibleTasks.map((task) => (
            <article
              key={task.id}
              className="overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
            >
              <div className="relative overflow-hidden rounded-[22px]">
                <img src={task.image} alt={task.title} className="h-28 w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-[#f3c969] px-2 py-1 text-[10px] font-bold text-black">
                  {task.badge}
                </span>
              </div>

              <div className="px-1 pb-1 pt-3">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{task.title}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-amber-600">${task.price}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                    {task.location}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl bg-black px-3 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-slate-800 active:scale-[0.97]"
                >
                  Grab Order
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Detail" title="任务详情卡" />
        <TaskDetailCard task={featuredTask} />
      </section>
    </div>
  )
}
