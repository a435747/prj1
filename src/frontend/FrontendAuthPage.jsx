import { useState } from 'react'

const REGIONS = [
  'Singapore',
  'Malaysia',
  'Thailand',
  'Indonesia',
  'Philippines',
  'Vietnam',
  'Hong Kong',
  'Other',
]

const initialForm = {
  username: '',
  nickname: '',
  phone: '',
  region: REGIONS[0],
  password: '',
  confirmPassword: '',
  inviteCode: '',
  agreeTerms: false,
  confirmAdult: false,
}

export function FrontendAuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [welcome, setWelcome] = useState(null)

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setForm(initialForm)
    setError('')
    setWelcome(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    const username = form.username.trim()
    const nickname = form.nickname.trim()
    const phone = form.phone.trim()
    const region = form.region.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword
    const inviteCode = form.inviteCode.trim()

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (mode === 'register') {
      if (nickname.length < 2) {
        setError('Nickname must be at least 2 characters.')
        return
      }
      if (!/^\+?[0-9\s-]{6,20}$/.test(phone)) {
        setError('Please enter a valid phone number.')
        return
      }
      if (!region) {
        setError('Please select your region.')
        return
      }
      if (password !== confirmPassword) {
        setError('The two passwords do not match.')
        return
      }
      if (!inviteCode) {
        setError('Invitation code is required.')
        return
      }
      if (!form.agreeTerms) {
        setError('Please agree to the platform terms.')
        return
      }
      if (!form.confirmAdult) {
        setError('You must confirm that you are at least 18 years old.')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await onLogin({ username, password })
      } else {
        const result = await onRegister({
          username,
          nickname,
          phone,
          region,
          password,
          inviteCode,
          agreeTerms: form.agreeTerms,
          confirmAdult: form.confirmAdult,
        })
        setWelcome({
          username: result?.user?.username ?? username,
          invitedBy: result?.user?.invitedBy ?? 'SYSTEM',
        })
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
          <p className="text-xs uppercase tracking-[0.34em] text-white/50">TTS shop</p>
          <h1 className="mt-2 text-3xl font-semibold">{mode === 'login' ? 'User Login' : 'Create Account'}</h1>
          <p className="mt-2 text-sm text-white/60">
            {mode === 'login'
              ? 'Sign in to access your personal tasks and withdrawal records.'
              : 'Create your member account, bind your information, and start your first product order task.'}
          </p>
        </div>

        {welcome ? (
          <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
            <p className="font-semibold">Welcome, {welcome.username}.</p>
            <p className="mt-1">Registration completed successfully. Referrer: {welcome.invitedBy}.</p>
            <div className="mt-3 space-y-1 text-xs text-emerald-100/90">
              <p>Next step 1: Complete real-name verification.</p>
              <p>Next step 2: Review your first task in the task hall.</p>
              <p>Next step 3: Contact support if your inviter gave you a special task code.</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <input
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="Username (letters, numbers, underscores)"
          />

          {mode === 'register' ? (
            <>
              <input className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300" value={form.nickname} onChange={(e) => updateField('nickname', e.target.value)} placeholder="Nickname" />
              <input className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone number" />
              <select className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition focus:border-amber-300" value={form.region} onChange={(e) => updateField('region', e.target.value)}>
                {REGIONS.map((region) => (
                  <option key={region} value={region} className="text-black">{region}</option>
                ))}
              </select>
            </>
          ) : null}

          <input type="password" className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Password (at least 6 characters)" />

          {mode === 'register' ? (
            <>
              <input type="password" className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Confirm password" />
              <input className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300" value={form.inviteCode} onChange={(e) => updateField('inviteCode', e.target.value)} placeholder="Invitation code / referral code" />
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-100/90">
                Registration requires valid contact information, a referral code, and agreement to platform rules before task access is granted.
              </div>
              <label className="flex items-start gap-3 text-sm text-white/80">
                <input type="checkbox" checked={form.agreeTerms} onChange={(e) => updateField('agreeTerms', e.target.checked)} className="mt-1" />
                <span>I have read and agree to the platform service terms and order task rules.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-white/80">
                <input type="checkbox" checked={form.confirmAdult} onChange={(e) => updateField('confirmAdult', e.target.checked)} className="mt-1" />
                <span>I confirm that I am at least 18 years old and can use the platform independently.</span>
              </label>
            </>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60">
          {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <button type="button" onClick={switchMode} className="mt-3 w-full text-sm text-white/70 underline-offset-2 hover:underline">
          {mode === 'login' ? 'No account yet? Register here' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  )
}
