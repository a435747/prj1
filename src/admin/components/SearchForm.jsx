const selectOptions = {
  level: ['全部', 'VIP1', 'VIP2', 'VIP3'],
  status: ['全部', '正常', '冻结', '处理中', '已通过', '已驳回'],
  channel: ['全部', 'USDT', '支付宝', '微信'],
  primaryAgent: ['全部', '华东代理', '华南代理'],
  secondaryAgent: ['全部', '上海组', '深圳组', '杭州组'],
  paymentMethod: ['全部', 'USDT', '支付宝', '微信', '银行卡'],
}

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

export function SearchForm({ values, onChange, onSearch, onExport }) {
  const setValue = (key, value) => onChange((prev) => ({ ...prev, [key]: value }))

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="用户名称">
          <input className={inputClass} value={values.username} onChange={(e) => setValue('username', e.target.value)} />
        </Field>
        <Field label="手机号">
          <input className={inputClass} value={values.phone} onChange={(e) => setValue('phone', e.target.value)} />
        </Field>
        <Field label="ID/绑定用户ID">
          <input className={inputClass} value={values.bindUserId} onChange={(e) => setValue('bindUserId', e.target.value)} />
        </Field>
        <Field label="订单号">
          <input className={inputClass} value={values.orderNo} onChange={(e) => setValue('orderNo', e.target.value)} />
        </Field>
        <Field label="邀请码">
          <input className={inputClass} value={values.inviteCode} onChange={(e) => setValue('inviteCode', e.target.value)} />
        </Field>
        {Object.entries(selectOptions).map(([key, options]) => (
          <Field key={key} label={key === 'primaryAgent' ? '一级代理' : key === 'secondaryAgent' ? '二级代理' : key === 'paymentMethod' ? '支付方式' : key === 'channel' ? '渠道' : key === 'level' ? '等级' : '状态'}>
            <select className={inputClass} value={values[key]} onChange={(e) => setValue(key, e.target.value)}>
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
        ))}
        <Field label="打针幅度">
          <input className={inputClass} value={values.minRate} onChange={(e) => setValue('minRate', e.target.value)} />
        </Field>
        <Field label="注册时间">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={inputClass} value={values.registerStart} onChange={(e) => setValue('registerStart', e.target.value)} />
            <input type="date" className={inputClass} value={values.registerEnd} onChange={(e) => setValue('registerEnd', e.target.value)} />
          </div>
        </Field>
        <Field label="下单时间">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={inputClass} value={values.orderStart} onChange={(e) => setValue('orderStart', e.target.value)} />
            <input type="date" className={inputClass} value={values.orderEnd} onChange={(e) => setValue('orderEnd', e.target.value)} />
          </div>
        </Field>
        <Field label="发起时间">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={inputClass} value={values.initiateStart} onChange={(e) => setValue('initiateStart', e.target.value)} />
            <input type="date" className={inputClass} value={values.initiateEnd} onChange={(e) => setValue('initiateEnd', e.target.value)} />
          </div>
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={onSearch} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95">搜索</button>
        <button type="button" onClick={onExport} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 active:scale-95">导出</button>
      </div>
    </section>
  )
}
