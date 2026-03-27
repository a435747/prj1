export function StatsCard({ title, items, tone = 'default' }) {
  const accentClass = tone === 'dark'
    ? 'from-slate-900 via-slate-800 to-slate-700 text-white'
    : tone === 'blue'
      ? 'from-blue-600 via-blue-500 to-cyan-500 text-white'
      : 'from-white to-slate-50 text-slate-900'

  return (
    <section className={`rounded-2xl border border-slate-200 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${accentClass}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className={`text-xs ${tone === 'default' ? 'text-slate-400' : 'text-white/70'}`}>已按当前页面更新</span>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl p-3 ${tone === 'default' ? 'bg-slate-50' : 'bg-white/10'}`}>
            <p className={`text-xs ${tone === 'default' ? 'text-slate-500' : 'text-white/70'}`}>{item.label}</p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
