export function SectionTitle({ eyebrow, title, action, onAction }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 active:scale-95"
        >
          {action}
        </button>
      ) : null}
    </div>
  )
}
