import { useState } from 'react'

export function AccountPanel({ username, onSubmit }) {
  const [form, setForm] = useState({ currentPassword: '', newUsername: username ?? '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!form.currentPassword || !form.newUsername) {
      setError('请填写当前密码和新账号')
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit({
        currentPassword: form.currentPassword,
        newUsername: form.newUsername,
        newPassword: form.newPassword,
      })
      setMessage(result.message || '账户更新成功')
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">管理员账户设置</h3>
        <p className="mt-1 text-sm text-slate-500">可修改登录账号，也可顺便重置密码。</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="password"
          placeholder="当前密码"
          className="h-10 rounded-lg border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          value={form.currentPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
        />
        <input
          type="text"
          placeholder="新账号"
          className="h-10 rounded-lg border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          value={form.newUsername}
          onChange={(e) => setForm((prev) => ({ ...prev, newUsername: e.target.value }))}
        />
        <input
          type="password"
          placeholder="新密码（可选）"
          className="h-10 rounded-lg border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          value={form.newPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
        />
        <div className="flex items-center gap-3 md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? '提交中...' : '更新账户'}
          </button>
          {message ? <span className="text-sm text-emerald-600">{message}</span> : null}
          {error ? <span className="text-sm text-red-500">{error}</span> : null}
        </div>
      </form>
    </section>
  )
}
