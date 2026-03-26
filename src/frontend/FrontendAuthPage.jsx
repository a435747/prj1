import { useState } from 'react'

export function FrontendAuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const username = form.username.trim()
    const password = form.password

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await onLogin({ username, password })
      } else {
        await onRegister({ username, password })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#050505,#111827)] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.34em] text-white/50">Finance Task Hub</p>
          <h1 className="mt-2 text-3xl font-semibold">{mode === 'login' ? 'User Login' : 'Create Account'}</h1>
          <p className="mt-2 text-sm text-white/60">Sign in to access your personal tasks and withdrawal records.</p>
        </div>

        <div className="space-y-4">
          <input
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition focus:border-amber-300"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Username (letters, numbers, underscores)"
          />
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition focus:border-amber-300"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password (at least 6 characters)"
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register and Login'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === 'login' ? 'register' : 'login'))
            setError('')
          }}
          className="mt-3 w-full text-sm text-white/70 underline-offset-2 hover:underline"
        >
          {mode === 'login' ? 'No account yet? Register here' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  )
}
