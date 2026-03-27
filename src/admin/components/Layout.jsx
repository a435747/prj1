export function Layout({ sidebar, navbar, children }) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_20%),linear-gradient(180deg,#f8fafc,#eef2ff)] text-slate-800">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {navbar}
        <main className="min-h-0 flex-1 overflow-auto p-5">{children}</main>
      </div>
    </div>
  )
}
