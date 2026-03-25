export function Sidebar({ collapsed, activeKey, onSelect, onToggle, menus }) {
  return (
    <aside
      className={`flex h-screen shrink-0 flex-col bg-[#1f2d3d] text-white transition-all duration-300 ${
        collapsed ? 'w-[76px]' : 'w-[220px]'
      }`}
    >
      <div className="flex h-[60px] items-center justify-between border-b border-white/10 px-4">
        <span className={`text-sm font-semibold tracking-wide ${collapsed ? 'hidden' : 'block'}`}>
          Task Admin
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md px-2 py-1 text-xs text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {menus.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed ? (
              <p className="mb-2 px-3 text-xs font-medium tracking-[0.2em] text-white/40">
                {group.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.key === activeKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    className={`flex w-full items-center rounded-r-lg border-l-4 px-3 py-2.5 text-sm transition ${
                      active
                        ? 'border-l-blue-500 bg-white/10 text-white'
                        : 'border-l-transparent text-white/70 hover:bg-white/6 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <span className="truncate">{collapsed ? item.label.slice(0, 2) : item.label}</span>
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
