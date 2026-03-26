import { useState } from 'react'

export function SecurityCenterPage({ onChangePassword }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Security</p>
        <h4 className="mt-2 text-xl font-semibold">Security Center</h4>
        <p className="mt-2 text-sm text-white/80">We recommend changing your password regularly and completing identity verification for stronger account protection.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Password Strength', 'Enabled', 'Recommended to update regularly'],
          ['Verification Status', 'Recommended', 'Improve account credibility'],
          ['Risk Control', 'Normal', 'No unusual activity detected'],
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <form
          className="rounded-2xl border border-slate-100 bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const body = {
              currentPassword: String(formData.get('currentPassword') || ''),
              newPassword: String(formData.get('newPassword') || ''),
            }
            setSubmitting(true)
            setError('')
            setSuccess('')
            try {
              const result = await onChangePassword?.(body)
              setSuccess(result?.message || 'Password updated successfully.')
              event.currentTarget.reset()
            } catch (err) {
              setError(err.message || 'Password update failed.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <p className="font-semibold text-slate-900">Change Login Password</p>
          <div className="mt-3 space-y-3">
            <input name="currentPassword" type="password" placeholder="Current Password" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" />
            <input name="newPassword" type="password" placeholder="New Password (at least 6 characters)" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" />
          </div>
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-emerald-600">{success}</p> : null}
          <button type="submit" disabled={submitting} className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Update Password'}
          </button>
        </form>

        {[
          ['Payout Accounts', 'Multiple payout methods are supported. Please confirm your account details before submitting.'],
          ['Device Security', 'This device is currently your most recently active device.'],
          ['Risk Alert', 'Unusual login locations or frequent withdrawals may trigger manual review.'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
