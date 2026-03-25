import { useEffect } from 'react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onClose, 2600)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const toneClass = toast.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100]">
      <div className={`pointer-events-auto min-w-[260px] rounded-xl border px-4 py-3 shadow-lg ${toneClass}`}>
        <div className="text-sm font-semibold">{toast.title}</div>
        {toast.message ? <div className="mt-1 text-sm opacity-90">{toast.message}</div> : null}
      </div>
    </div>
  )
}
