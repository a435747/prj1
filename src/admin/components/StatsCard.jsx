export function StatsCard({ title, items }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400">已按筛选更新</span>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
