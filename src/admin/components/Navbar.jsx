import { useEffect, useState } from 'react'

function formatNow(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function Navbar({ title, subtitle, onRefresh, adminUsername = 'admin' }) {
  const [now, setNow] = useState(formatNow(new Date()))

  useEffect(() => {
    const timer = setInterval(() => setNow(formatNow(new Date())), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Operations Console</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">{now}</div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            通知中心
            <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">12</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 active:scale-95"
          >
            刷新数据
          </button>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700">
            {adminUsername}
          </div>
        </div>
      </div>
    </header>
  )
}
