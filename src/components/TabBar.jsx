function Icon({ type, active }) {
  const base = active ? 'stroke-[#f3c969]' : 'stroke-slate-500'

  const icons = {
    home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    tasks: (
      <>
        <rect x="4" y="5" width="16" height="4" rx="2" />
        <rect x="4" y="11" width="16" height="4" rx="2" />
        <rect x="4" y="17" width="10" height="4" rx="2" />
      </>
    ),
    feed: (
      <>
        <path d="M5 17c2.5-3.2 5.6-4.8 9.2-4.8 1.9 0 3.8.5 5.8 1.5" />
        <path d="M7 12.5c1.8-2.1 4-3.2 6.7-3.2 2 0 4 .7 6.3 2.2" />
        <path d="M9.5 8.5c1.2-1 2.6-1.5 4.1-1.5 1.6 0 3.2.6 4.9 1.8" />
        <circle cx="6" cy="18" r="1.5" fill="none" />
      </>
    ),
    rank: (
      <>
        <path d="M5 19h14" />
        <path d="M7 19V9" />
        <path d="M12 19V5" />
        <path d="M17 19v-7" />
      </>
    ),
    support: (
      <>
        <path d="M6 9.5a6 6 0 0 1 12 0c0 4.5-4.2 6.2-6 6.2-.8 0-1.6-.2-2.3-.5L6 17l1.1-3A5.8 5.8 0 0 1 6 9.5Z" />
        <path d="M9 9.5h.01" />
        <path d="M12 9.5h.01" />
        <path d="M15 9.5h.01" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.7-3 4-4.5 7-4.5s5.3 1.5 7 4.5" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${base}`}
    >
      {icons[type]}
    </svg>
  )
}

export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-white/40 bg-white/78 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const active = tab.key === activeTab

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 transition duration-200 active:scale-95 ${
                active
                  ? 'bg-black text-[#f3c969] shadow-[0_8px_20px_rgba(0,0,0,0.2)]'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              <Icon type={tab.icon} active={active} />
              <span className="mt-1 text-[11px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
