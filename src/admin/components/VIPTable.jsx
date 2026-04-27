import { useMemo, useState } from 'react'

const VIP_DEFAULTS = [
  { id: 'vip1', name: 'VIP 1', commissionRate: '5%', withdrawLimit: '$500', orderTimes: 30, withdrawTimes: 3, minBalance: '$0' },
  { id: 'vip2', name: 'VIP 2', commissionRate: '8%', withdrawLimit: '$2,000', orderTimes: 60, withdrawTimes: 5, minBalance: '$0' },
  { id: 'vip3', name: 'VIP 3', commissionRate: '12%', withdrawLimit: '$5,000', orderTimes: 100, withdrawTimes: 10, minBalance: '$0' },
]

const inputClass = 'h-9 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

export function VIPTable({ rows = [], onSaveVipLevels, saving }) {
  const sourceLevels = useMemo(() => (rows.length ? rows : VIP_DEFAULTS), [rows])
  const [levels, setLevels] = useState(sourceLevels)
  const [dirty, setDirty] = useState(false)

  const displayLevels = dirty ? levels : sourceLevels

  const update = (index, key, value) => {
    const base = dirty ? levels : sourceLevels
    setLevels(base.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    setDirty(true)
  }

  const FIELDS = [
    { key: 'name', label: 'Level Name' },
    { key: 'commissionRate', label: 'Commission Rate' },
    { key: 'withdrawLimit', label: 'Withdraw Limit' },
    { key: 'orderTimes', label: 'Max Orders/Day' },
    { key: 'withdrawTimes', label: 'Max Withdrawals/Day' },
    { key: 'minBalance', label: 'Min Balance Required' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">VIP Configuration</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">VIP Level Settings</h3>
            <p className="mt-1 text-sm text-slate-500">Edit commission rates, withdrawal limits and task quotas per VIP level.</p>
          </div>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => onSaveVipLevels?.(displayLevels)}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {displayLevels.map((level, index) => (
            <div key={level.id ?? index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{level.name}</p>
              <div className="space-y-2">
                {FIELDS.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{field.label}</span>
                    <input
                      className={inputClass}
                      value={level[field.key] ?? ''}
                      onChange={(e) => update(index, field.key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {dirty && (
          <p className="mt-3 text-xs text-amber-600">You have unsaved changes. Click Save Changes to apply.</p>
        )}
      </div>
    </div>
  )
}
