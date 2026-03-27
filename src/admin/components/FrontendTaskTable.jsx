import { useState } from 'react'
import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'price', label: 'Price' },
  { key: 'multiplier', label: '任务倍率' },
  { key: 'city', label: 'City' },
  { key: 'location', label: 'Location' },
  { key: 'badge', label: 'Badge' },
  { key: 'type', label: 'Type' },
]

const DEFAULT_NEW_TASK = {
  title: '',
  price: 0,
  multiplier: 1,
  city: '',
  location: '',
  badge: 'HOT',
  type: 'Nearby',
  commission: '',
  time: '',
  rating: 4.8,
  description: '',
  image: '',
  verified: ['Verified'],
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

export function FrontendTaskTable({ rows = [], page, onPageChange, onSelect, onAddTask, onDeleteTask }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(DEFAULT_NEW_TASK)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleAdd = () => {
    if (!form.title.trim()) return
    onAddTask?.({
      ...form,
      price: Number(form.price) || 0,
      multiplier: Number(form.multiplier) || 1,
      rating: Number(form.rating) || 4.8,
      commission: form.commission || `$${form.price}`,
    })
    setForm(DEFAULT_NEW_TASK)
    setShowAdd(false)
  }

  return (
    <div className="space-y-4">
      {/* Add Task Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-800">Task List Management</p>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            {showAdd ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {showAdd && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">New Task Details</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className={inputClass} placeholder="Task Title *" value={form.title} onChange={(e) => set('title', e.target.value)} />
              <input className={inputClass} placeholder="Price (number)" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
              <input className={inputClass} placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
              <input className={inputClass} placeholder="Location / District" value={form.location} onChange={(e) => set('location', e.target.value)} />
              <input className={inputClass} placeholder="任务倍率，e.g. 1、1.5、2（完成后计入提现积分）" type="number" step="0.1" min="0.1" value={form.multiplier} onChange={(e) => set('multiplier', e.target.value)} />
              <input className={inputClass} placeholder="Commission display, e.g. $58" value={form.commission} onChange={(e) => set('commission', e.target.value)} />
              <input className={inputClass} placeholder="Time required, e.g. 25 mins" value={form.time} onChange={(e) => set('time', e.target.value)} />
              <select className={inputClass} value={form.badge} onChange={(e) => set('badge', e.target.value)}>
                <option value="HOT">HOT</option>
                <option value="NEW">NEW</option>
                <option value="TOP">TOP</option>
                <option value="VIP">VIP</option>
              </select>
              <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="Nearby">Nearby</option>
                <option value="Easy">Easy</option>
                <option value="High Pay">High Pay</option>
                <option value="Online">Online</option>
              </select>
              <input className={inputClass} placeholder="Rating (0–5)" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
              <input
                className={`${inputClass} sm:col-span-2`}
                placeholder="Image URL (https://...)"
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
              />
              <textarea
                rows={2}
                className="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none w-full"
                placeholder="Task description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAdd(false); setForm(DEFAULT_NEW_TASK) }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-500 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!form.title.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        title="Task List"
        columns={columns}
        rows={rows}
        page={page}
        onPageChange={onPageChange}
        renderActions={(row) => {
          if (confirmDeleteId === row.id) {
            return (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Confirm delete?</span>
                <button
                  type="button"
                  onClick={() => { onDeleteTask?.(row.id); setConfirmDeleteId(null) }}
                  className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            )
          }
          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelect?.(row.id)}
                className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(row.id)}
                className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          )
        }}
      />
    </div>
  )
}
