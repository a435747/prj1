import { useState } from 'react'

function Field({ label, span = 1, children }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-slate-600 ${span === 2 ? 'md:col-span-2' : ''}`}>
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const textareaClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none'

export function FrontendContentEditor({ data, selectedTaskId, onSelectTask, onUpdate }) {
  const [imgPreviewError, setImgPreviewError] = useState(false)
  const selectedTask = data.tasks.find((item) => item.id === selectedTaskId) ?? data.tasks[0]

  const updateTask = (key, value) => {
    setImgPreviewError(false)
    onUpdate((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === selectedTask.id ? { ...task, [key]: value } : task)),
      featuredTasks: prev.featuredTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, [key]: value } : task,
      ),
    }))
  }

  const updateVerified = (index, value) => {
    const next = [...(selectedTask.verified ?? [])]
    next[index] = value
    updateTask('verified', next.filter(Boolean))
  }

  const addVerified = () => {
    updateTask('verified', [...(selectedTask.verified ?? []), ''])
  }

  const removeVerified = (index) => {
    const next = (selectedTask.verified ?? []).filter((_, i) => i !== index)
    updateTask('verified', next)
  }

  return (
    <div className="space-y-4">
      {/* ── Platform Settings ───────────────────────────────────────── */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Platform Settings</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Today Earnings">
            <input
              className={inputClass}
              value={data.homeStats[0].value}
              onChange={(e) => onUpdate((prev) => ({ ...prev, homeStats: [{ ...prev.homeStats[0], value: e.target.value }, prev.homeStats[1]] }))}
            />
          </Field>
          <Field label="Online Users">
            <input
              className={inputClass}
              value={data.homeStats[1].value}
              onChange={(e) => onUpdate((prev) => ({ ...prev, homeStats: [prev.homeStats[0], { ...prev.homeStats[1], value: e.target.value }] }))}
            />
          </Field>
          <Field label="Ticker / Announcement 1" span={2}>
            <input
              className={inputClass}
              value={data.tickerItems[0] ?? ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, tickerItems: [e.target.value, ...prev.tickerItems.slice(1)] }))}
            />
          </Field>
          <Field label="Ticker / Announcement 2" span={2}>
            <input
              className={inputClass}
              value={data.tickerItems[1] ?? ''}
              onChange={(e) => {
                const items = [...(data.tickerItems ?? [])]
                items[1] = e.target.value
                onUpdate((prev) => ({ ...prev, tickerItems: items }))
              }}
            />
          </Field>
          <Field label="Ticker / Announcement 3" span={2}>
            <input
              className={inputClass}
              value={data.tickerItems[2] ?? ''}
              onChange={(e) => {
                const items = [...(data.tickerItems ?? [])]
                items[2] = e.target.value
                onUpdate((prev) => ({ ...prev, tickerItems: items }))
              }}
            />
          </Field>
          <Field label="Ticker / Announcement 4" span={2}>
            <input
              className={inputClass}
              value={data.tickerItems[3] ?? ''}
              onChange={(e) => {
                const items = [...(data.tickerItems ?? [])]
                items[3] = e.target.value
                onUpdate((prev) => ({ ...prev, tickerItems: items }))
              }}
            />
          </Field>
          <Field label="Customer Service Link (Recharge Page)" span={2}>
            <input
              className={inputClass}
              value={data.supportLink ?? ''}
              placeholder="https://t.me/your_handle"
              onChange={(e) => onUpdate((prev) => ({ ...prev, supportLink: e.target.value }))}
            />
          </Field>
        </div>
      </section>

      {/* ── Task Editor ─────────────────────────────────────────────── */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-800">Task Editor</h3>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400"
            value={selectedTask?.id ?? ''}
            onChange={(e) => {
              setImgPreviewError(false)
              onSelectTask(Number(e.target.value))
            }}
          >
            {data.tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Basic Info */}
          <Field label="Task Title" span={2}>
            <input className={inputClass} value={selectedTask?.title ?? ''} onChange={(e) => updateTask('title', e.target.value)} />
          </Field>
          <Field label="Price ($)">
            <input type="number" min="0" className={inputClass} value={selectedTask?.price ?? ''} onChange={(e) => updateTask('price', Number(e.target.value) || 0)} />
          </Field>
          <Field label="Commission (display)">
            <input className={inputClass} value={selectedTask?.commission ?? ''} placeholder="e.g. $58" onChange={(e) => updateTask('commission', e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputClass} value={selectedTask?.city ?? ''} onChange={(e) => updateTask('city', e.target.value)} />
          </Field>
          <Field label="Location / District">
            <input className={inputClass} value={selectedTask?.location ?? ''} onChange={(e) => updateTask('location', e.target.value)} />
          </Field>
          <Field label="Badge">
            <select className={inputClass} value={selectedTask?.badge ?? 'HOT'} onChange={(e) => updateTask('badge', e.target.value)}>
              <option value="HOT">HOT</option>
              <option value="NEW">NEW</option>
              <option value="TOP">TOP</option>
              <option value="VIP">VIP</option>
            </select>
          </Field>
          <Field label="Type / Category">
            <select className={inputClass} value={selectedTask?.type ?? 'Nearby'} onChange={(e) => updateTask('type', e.target.value)}>
              <option value="Nearby">Nearby</option>
              <option value="Easy">Easy</option>
              <option value="High Pay">High Pay</option>
              <option value="Online">Online</option>
            </select>
          </Field>
          <Field label="Time Required">
            <input className={inputClass} value={selectedTask?.time ?? ''} placeholder="e.g. 25 mins" onChange={(e) => updateTask('time', e.target.value)} />
          </Field>
          <Field label="Rating (0–5)">
            <input type="number" min="0" max="5" step="0.1" className={inputClass} value={selectedTask?.rating ?? ''} onChange={(e) => updateTask('rating', Number(e.target.value) || 0)} />
          </Field>

          {/* Description */}
          <Field label="Description" span={2}>
            <textarea
              rows={3}
              className={textareaClass + ' w-full'}
              value={selectedTask?.description ?? ''}
              onChange={(e) => updateTask('description', e.target.value)}
            />
          </Field>

          {/* Image */}
          <Field label="Image URL" span={2}>
            <input
              className={inputClass}
              value={selectedTask?.image ?? ''}
              placeholder="https://images.unsplash.com/..."
              onChange={(e) => {
                setImgPreviewError(false)
                updateTask('image', e.target.value)
              }}
            />
          </Field>
          {selectedTask?.image && !imgPreviewError && (
            <div className="md:col-span-2">
              <img
                src={selectedTask.image}
                alt="preview"
                onError={() => setImgPreviewError(true)}
                className="h-40 w-full rounded-xl object-cover"
              />
            </div>
          )}
          {imgPreviewError && (
            <p className="text-xs text-red-400 md:col-span-2">Image URL could not be loaded. Please check the address.</p>
          )}

          {/* Verified Tags */}
          <div className="md:col-span-2">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">Verification Tags</p>
            <div className="space-y-2">
              {(selectedTask?.verified ?? []).map((tag, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass + ' flex-1'}
                    value={tag}
                    placeholder="e.g. Verified, Video Verified"
                    onChange={(e) => updateVerified(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeVerified(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVerified}
                className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 transition hover:border-blue-300 hover:text-blue-500"
              >
                + Add Tag
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
