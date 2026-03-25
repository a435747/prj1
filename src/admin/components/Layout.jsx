export function Layout({ sidebar, navbar, children }) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5] text-slate-800">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {navbar}
        <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
