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

export function Navbar({ title, onRefresh, adminUsername = 'admin' }) {
  const [now, setNow] = useState(formatNow(new Date()))

  useEffect(() => {
    const timer = setInterval(() => setNow(formatNow(new Date())), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between bg-[#2f4056] px-4 text-white shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden text-white/80 md:inline">{now}</span>
        <button
          type="button"
          className="relative rounded-md px-3 py-2 transition hover:bg-white/10 active:scale-95"
        >
          通知
          <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px]">12</span>
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md px-3 py-2 transition hover:bg-white/10 active:scale-95"
        >
          刷新
        </button>
        <div className="rounded-md bg-white/10 px-3 py-2 text-white/90">
          {adminUsername} ▾
        </div>
      </div>
    </header>
  )
}
