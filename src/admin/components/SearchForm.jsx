function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

const statusMap = {
  frontendTasks: ['全部', 'HOT', 'NEW'],
  taskClaims: ['全部', '待审核', '待提交', '已完成', '已驳回'],
  verifications: ['全部', '待审核', '已通过', '已驳回'],
  withdraw: ['全部', '待审核', '已通过', '已驳回'],
  users: ['全部', '正常', '冻结'],
  orders: ['全部', '待处理', '审核中', '已完成'],
  recharge: ['全部', '成功', '待确认', '失败'],
}

const pagePlaceholders = {
  frontendTasks: '请输入任务标题 / 城市 / 位置',
  taskClaims: '请输入用户名 / 任务名称 / 记录ID',
  verifications: '请输入用户名 / 真实姓名 / 证件号',
  withdraw: '请输入用户名 / 订单号 / 收款账号',
  users: '请输入用户名 / 手机号 / 邀请码',
  orders: '请输入订单号 / 用户名',
  recharge: '请输入订单号 / 用户名 / 手机号',
}

export function SearchForm({ activeKey, values, onChange, onSearch, onReset, onExport, resultCount = 0 }) {
  const setValue = (key, value) => onChange((prev) => ({ ...prev, [key]: value }))
  const statusOptions = statusMap[activeKey] ?? ['全部']
  const placeholder = pagePlaceholders[activeKey] ?? '请输入关键词'
  const showDate = ['taskClaims', 'verifications', 'withdraw', 'orders', 'recharge', 'users'].includes(activeKey)
  const filterSummary = [
    values.keyword ? `关键词：${values.keyword}` : null,
    values.status !== '全部' ? `状态：${values.status}` : null,
    values.channel ? `渠道：${values.channel}` : null,
    values.startDate ? `开始：${values.startDate}` : null,
    values.endDate ? `结束：${values.endDate}` : null,
  ].filter(Boolean)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => {
          const active = values.status === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => setValue('status', option)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="关键词">
            <input
              className={inputClass}
              value={values.keyword}
              onChange={(e) => setValue('keyword', e.target.value)}
              placeholder={placeholder}
            />
          </Field>

          <Field label="状态">
            <select className={inputClass} value={values.status} onChange={(e) => setValue('status', e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>

          {['withdraw', 'recharge'].includes(activeKey) ? (
            <Field label="渠道 / 方式">
              <input
                className={inputClass}
                value={values.channel}
                onChange={(e) => setValue('channel', e.target.value)}
                placeholder="例如 USDT / 支付宝 / 银行卡"
              />
            </Field>
          ) : null}

          {showDate ? (
            <Field label="开始日期">
              <input type="date" className={inputClass} value={values.startDate} onChange={(e) => setValue('startDate', e.target.value)} />
            </Field>
          ) : null}

          {showDate ? (
            <Field label="结束日期">
              <input type="date" className={inputClass} value={values.endDate} onChange={(e) => setValue('endDate', e.target.value)} />
            </Field>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onSearch} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95">执行搜索</button>
          <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95">重置条件</button>
          <button type="button" onClick={onExport} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95">导出当前结果</button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterSummary.length ? filterSummary.map((item) => (
            <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {item}
            </span>
          )) : <span className="text-sm text-slate-400">当前未设置筛选条件</span>}
        </div>
        <div className="text-sm text-slate-500">当前结果：<span className="font-semibold text-slate-900">{resultCount}</span> 条</div>
      </div>
    </section>
  )
}
