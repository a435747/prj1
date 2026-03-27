import { useState } from 'react'

export function PasswordPanel({ onSubmit }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('请填写完整信息')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setMessage(result.message || '密码修改成功')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Security</p>
        <h3 className="mt-2 text-base font-semibold text-slate-900">修改管理员密码</h3>
        <p className="mt-1 text-sm text-slate-500">修改后将立即对后续登录生效，建议定期更新高强度密码。</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="password"
          placeholder="当前密码"
          className="h-11 rounded-xl border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          value={form.currentPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
        />
        <input
          type="password"
          placeholder="新密码"
          className="h-11 rounded-xl border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          value={form.newPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
        />
        <input
          type="password"
          placeholder="确认新密码"
          className="h-11 rounded-xl border border-slate-200 px-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          value={form.confirmPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
        />
        <div className="md:col-span-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? '提交中...' : '确认修改'}
          </button>
          {message ? <span className="text-sm text-emerald-600">{message}</span> : null}
          {error ? <span className="text-sm text-red-500">{error}</span> : null}
        </div>
      </form>
    </section>
  )
}
