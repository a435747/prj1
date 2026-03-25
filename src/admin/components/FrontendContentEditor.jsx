function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600">
      <span>{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

export function FrontendContentEditor({ data, selectedTaskId, onSelectTask, onUpdate }) {
  const selectedTask = data.tasks.find((item) => item.id === selectedTaskId) ?? data.tasks[0]

  const updateTask = (key, value) => {
    onUpdate((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === selectedTask.id ? { ...task, [key]: value } : task)),
      featuredTasks: prev.featuredTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, [key]: value } : task,
      ),
    }))
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">前台内容配置</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="今日收益">
            <input className={inputClass} value={data.homeStats[0].value} onChange={(e) => onUpdate((prev) => ({ ...prev, homeStats: [{ ...prev.homeStats[0], value: e.target.value }, prev.homeStats[1]] }))} />
          </Field>
          <Field label="在线人数">
            <input className={inputClass} value={data.homeStats[1].value} onChange={(e) => onUpdate((prev) => ({ ...prev, homeStats: [prev.homeStats[0], { ...prev.homeStats[1], value: e.target.value }] }))} />
          </Field>
          <Field label="首页公告 1">
            <input className={inputClass} value={data.tickerItems[0] ?? ''} onChange={(e) => onUpdate((prev) => ({ ...prev, tickerItems: [e.target.value, ...prev.tickerItems.slice(1)] }))} />
          </Field>
          <Field label="个人中心名称">
            <input className={inputClass} value={data.profile.name} onChange={(e) => onUpdate((prev) => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">前台任务编辑</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="选择任务">
            <select className={inputClass} value={selectedTask?.id ?? ''} onChange={(e) => onSelectTask(Number(e.target.value))}>
              {data.tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </Field>
          <Field label="任务标题">
            <input className={inputClass} value={selectedTask?.title ?? ''} onChange={(e) => updateTask('title', e.target.value)} />
          </Field>
          <Field label="任务价格">
            <input className={inputClass} value={selectedTask?.price ?? ''} onChange={(e) => updateTask('price', Number(e.target.value) || 0)} />
          </Field>
          <Field label="城市">
            <input className={inputClass} value={selectedTask?.city ?? ''} onChange={(e) => updateTask('city', e.target.value)} />
          </Field>
          <Field label="位置">
            <input className={inputClass} value={selectedTask?.location ?? ''} onChange={(e) => updateTask('location', e.target.value)} />
          </Field>
          <Field label="标签">
            <select className={inputClass} value={selectedTask?.badge ?? ''} onChange={(e) => updateTask('badge', e.target.value)}>
              <option value="HOT">HOT</option>
              <option value="NEW">NEW</option>
            </select>
          </Field>
        </div>
      </section>
    </div>
  )
}
