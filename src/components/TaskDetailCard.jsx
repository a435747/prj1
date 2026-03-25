function StarRow({ rating }) {
  const filled = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`text-sm ${index < filled ? 'text-amber-400' : 'text-slate-300'}`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-medium text-slate-600">{rating}</span>
    </div>
  )
}

export function TaskDetailCard({ task }) {
  if (!task) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 p-[1px] shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
      <div className="rounded-[27px] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.verified.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
            <p className="text-[11px] text-amber-500">预计佣金</p>
            <p className="text-lg font-bold text-amber-600">{task.commission}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{task.description}</p>

        <div className="mt-4">
          <StarRow rating={task.rating} />
        </div>

        <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>commission</span>
            <span className="font-semibold text-slate-900">{task.commission}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>time required</span>
            <span className="font-semibold text-slate-900">{task.time}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>location</span>
            <span className="font-semibold text-slate-900">{task.city} · {task.location}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)] active:scale-[0.98]"
        >
          Start Task
        </button>
      </div>
    </div>
  )
}
