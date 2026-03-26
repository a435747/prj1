import { SectionTitle } from '../components/SectionTitle'

export function HomePage({ platformData, onOpenTaskList, onOpenTask, onQuickAction }) {
  const { homeStats, tickerItems, featuredTasks, quickStats } = platformData

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <div className="grid grid-cols-2 gap-3">
          {homeStats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAction?.(item.label)}
              className="rounded-3xl bg-white/8 p-3 text-left backdrop-blur-sm transition hover:bg-white/12 active:scale-[0.98]"
            >
              <p className="text-xs text-white/60">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-[#f3c969]">{item.sub}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
          <div className="flex w-max min-w-full gap-8 whitespace-nowrap text-sm text-white/80 animate-marquee">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Featured" title="Hot Tasks" action="View All" onAction={onOpenTaskList} />
        <div className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {featuredTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask?.(task)}
              className="min-w-[220px] rounded-[28px] bg-white p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
            >
              <div className="relative overflow-hidden rounded-3xl">
                <img src={task.image} alt={task.title} className="h-32 w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-[#f3c969] px-2.5 py-1 text-[11px] font-bold text-black">
                  {task.tag ?? task.badge}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-amber-600">${task.price}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                    {task.city}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Account" title="Quick Stats" />
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAction?.(item.label)}
              className="rounded-[24px] bg-white p-3 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)] active:scale-[0.98]"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
