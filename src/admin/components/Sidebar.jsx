export function Sidebar({ collapsed, activeKey, onSelect, onToggle, menus }) {
  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0f172a,#111827_40%,#020617)] text-white transition-all duration-300 ${
        collapsed ? 'w-[82px]' : 'w-[250px]'
      }`}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-4">
        <div className={collapsed ? 'hidden' : 'block'}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">Admin Console</p>
          <p className="mt-1 text-sm font-semibold tracking-wide text-white">Money Task Platform</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {menus.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.26em] text-white/35">
                {group.title}
              </p>
            ) : null}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = item.key === activeKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm transition ${
                      active
                        ? 'bg-white text-slate-900 shadow-[0_10px_24px_rgba(255,255,255,0.12)]'
                        : 'text-white/70 hover:bg-white/8 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <span className="truncate font-medium">{collapsed ? item.label.slice(0, 2) : item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
