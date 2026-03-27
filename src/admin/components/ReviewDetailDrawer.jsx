import { DetailSheet } from '../../components/DetailSheet'

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
}

export function ReviewDetailDrawer({ open, title, subtitle, record, sections = [], onClose }) {
  if (!open || !record) return null

  const fallbackEntries = Object.entries(record).map(([key, value]) => ({ label: formatLabel(key), value }))
  const normalizedSections = sections.length
    ? sections
    : [{ title: '记录详情', items: fallbackEntries }]

  return (
    <DetailSheet title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-5">
        {normalizedSections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="text-sm font-semibold text-slate-900">{section.title}</h4>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.value || '--'}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DetailSheet>
  )
}
