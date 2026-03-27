import { useState } from 'react'

export function LoginPage({ onLogin, onBack }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_20%),linear-gradient(135deg,#0f172a,#111827,#1e293b)] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Secure Access</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">管理员登录</h1>
          <p className="mt-2 text-sm text-slate-500">请输入管理员账户信息继续进入运营后台。</p>
        </div>

        <div className="space-y-4">
          <input
            className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="管理员账号"
          />
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="登录密码"
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? '登录中...' : '进入后台'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            返回前台
          </button>
        </div>
      </form>
    </div>
  )
}
