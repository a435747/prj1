export function Header({ title }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-md bg-black/95 px-4 pb-4 pt-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.36em] text-white/45">
            Finance Task Hub
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/70">
          VIP 通道
        </div>
      </div>
    </header>
  )
}
