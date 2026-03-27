import { useState } from 'react'

const FIELDS = [
  { key: 'agent', label: 'Agent Group' },
  { key: 'name', label: 'Rule Name' },
  { key: 'minAmount', label: 'Min Amount' },
  { key: 'minCommissionRate', label: 'Min Commission Rate' },
  { key: 'orderCount', label: 'Order Count' },
  { key: 'ruleCount', label: 'Rule Count' },
  { key: 'userCount', label: 'User Count' },
  { key: 'recycle', label: 'Allow Recycle' },
  { key: 'requiredTaskCount', label: '提现所需任务积分' },
]

const DEFAULT_RULE = {
  agent: '',
  name: '',
  minAmount: '',
  minCommissionRate: '',
  orderCount: '',
  ruleCount: '',
  userCount: '',
  recycle: '允许',
  requiredTaskCount: '',
}

const inputClass = 'h-9 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

export function RuleTable({ rows = [], onSaveRules, saving }) {
  const [rules, setRules] = useState(rows)
  const [showAdd, setShowAdd] = useState(false)
  const [newRule, setNewRule] = useState(DEFAULT_RULE)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingData, setEditingData] = useState(null)
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null)
  const [dirty, setDirty] = useState(false)

  // Sync external rows changes
  useState(() => { setRules(rows) }, [rows])

  const markDirty = (next) => {
    setRules(next)
    setDirty(true)
  }

  const handleAdd = () => {
    if (!newRule.name.trim()) return
    markDirty([...rules, { ...newRule, id: `rule-${Date.now()}` }])
    setNewRule(DEFAULT_RULE)
    setShowAdd(false)
  }

  const handleSaveEdit = (index) => {
    const next = rules.map((r, i) => (i === index ? { ...r, ...editingData } : r))
    markDirty(next)
    setEditingIndex(null)
    setEditingData(null)
  }

  const handleDelete = (index) => {
    markDirty(rules.filter((_, i) => i !== index))
    setConfirmDeleteIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Rule Management</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Distribution Rules</h3>
            <p className="mt-1 text-sm text-slate-500">Manage agent distribution rules, commission thresholds and order quotas.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {showAdd ? 'Cancel' : '+ Add Rule'}
            </button>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => { onSaveRules?.(rules); setDirty(false) }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">New Rule</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{f.label}</span>
                  {f.key === 'recycle' ? (
                    <select className={inputClass} value={newRule.recycle} onChange={(e) => setNewRule((p) => ({ ...p, recycle: e.target.value }))}>
                      <option value="允许">Allowed</option>
                      <option value="禁止">Disabled</option>
                    </select>
                  ) : (
                    <input
                      className={inputClass}
                      value={newRule[f.key] ?? ''}
                      placeholder={f.label}
                      onChange={(e) => setNewRule((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowAdd(false); setNewRule(DEFAULT_RULE) }} className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Cancel</button>
              <button type="button" disabled={!newRule.name.trim()} onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
          </div>
        )}

        {dirty && <p className="mb-3 text-xs text-amber-600">Unsaved changes — click Save Changes to apply.</p>}

        <div className="space-y-3">
          {rules.length === 0 && (
            <div className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">No rules configured yet. Click Add Rule to get started.</div>
          )}
          {rules.map((rule, index) => (
            <div key={rule.id ?? index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {editingIndex === index ? (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {FIELDS.map((f) => (
                      <label key={f.key} className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{f.label}</span>
                        {f.key === 'recycle' ? (
                          <select className={inputClass} value={editingData.recycle} onChange={(e) => setEditingData((p) => ({ ...p, recycle: e.target.value }))}>
                            <option value="允许">Allowed</option>
                            <option value="禁止">Disabled</option>
                          </select>
                        ) : (
                          <input
                            className={inputClass}
                            value={editingData[f.key] ?? ''}
                            onChange={(e) => setEditingData((p) => ({ ...p, [f.key]: e.target.value }))}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditingIndex(null); setEditingData(null) }} className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Cancel</button>
                    <button type="button" onClick={() => handleSaveEdit(index)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Save</button>
                  </div>
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-4">
                    {FIELDS.map((f) => (
                      <div key={f.key}>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{f.label}</p>
                        <p className="text-sm font-medium text-slate-800">
                          {f.key === 'recycle' ? (rule.recycle === '允许' ? 'Allowed' : 'Disabled') : (rule[f.key] || '--')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingIndex(index); setEditingData({ ...rule }) }}
                      className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    {confirmDeleteIndex === index ? (
                      <>
                        <button type="button" onClick={() => handleDelete(index)} className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100">Confirm</button>
                        <button type="button" onClick={() => setConfirmDeleteIndex(null)} className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">Cancel</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmDeleteIndex(index)} className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100">Delete</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
