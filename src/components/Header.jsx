export function Header({ title, onVipClick, supportLink }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-md bg-black/95 px-4 pb-4 pt-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.36em] text-white/45">
            Finance Task Hub
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={supportLink || 'https://t.me/your_support_handle'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/20 active:scale-95"
          >
            <span>💬</span>
            <span>Support</span>
          </a>
          <button
            type="button"
            onClick={onVipClick}
            className="rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:border-amber-400/70 hover:bg-amber-400/20 active:scale-95"
          >
            ✦ VIP
          </button>
        </div>
      </div>
    </header>
  )
}
