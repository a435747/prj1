import { useState } from 'react'

const INFO_PANELS = [
  {
    key: 'payout',
    title: 'Payout Accounts',
    short: 'Multiple payout methods supported.',
    detail: [
      'You can withdraw via USDT (TRC20), Bank Card, or Alipay.',
      'Make sure the account name matches your verified real name.',
      'For Bank Card withdrawals, include the bank name when submitting.',
      'Large withdrawals may require additional manual review by the platform.',
    ],
  },
  {
    key: 'device',
    title: 'Device Security',
    short: 'This device is your most recently active session.',
    detail: [
      'Your account is currently active on this device.',
      'If you notice any unfamiliar login activity, change your password immediately.',
      'Avoid using shared or public devices to access your account.',
      'Logging out after each session is recommended on non-personal devices.',
    ],
  },
  {
    key: 'risk',
    title: 'Risk Alert',
    short: 'No unusual activity detected.',
    detail: [
      'Unusual login locations or IP addresses may trigger a security hold.',
      'Frequent large withdrawal requests may require manual review.',
      'Always ensure your submitted task proof and account info are accurate.',
      'Accounts with suspicious activity may be temporarily restricted.',
    ],
  },
]

export function SecurityCenterPage({ onChangePassword, frontendUser }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expanded, setExpanded] = useState(null)

  const isVerified =
    frontendUser?.verification?.status === 'approved' ||
    frontendUser?.verification?.status === '已通过'

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Security</p>
        <h4 className="mt-2 text-xl font-semibold">Security Center</h4>
        <p className="mt-2 text-sm text-white/80">Keep your account safe. Change your password regularly and complete identity verification.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Password</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Protected</p>
          <p className="mt-1 text-xs text-slate-500">Update regularly for best security.</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Verification</p>
          <p className={`mt-2 text-lg font-semibold ${isVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
            {isVerified ? 'Verified' : 'Not Verified'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isVerified ? 'Identity confirmed.' : 'Complete verification to unlock withdrawals.'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk Control</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Normal</p>
          <p className="mt-1 text-xs text-slate-500">No unusual activity detected.</p>
        </div>
      </div>

      <section className="space-y-3">
        <form
          className="rounded-2xl border border-slate-100 bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const currentPassword = String(formData.get('currentPassword') || '')
            const newPassword = String(formData.get('newPassword') || '')
            const confirmPassword = String(formData.get('confirmPassword') || '')

            if (!currentPassword || !newPassword || !confirmPassword) {
              setError('Please fill in all password fields.')
              return
            }

            if (newPassword.length < 6) {
              setError('New password must be at least 6 characters.')
              return
            }

            if (newPassword !== confirmPassword) {
              setError('New passwords do not match.')
              return
            }

            setSubmitting(true)
            setError('')
            setSuccess('')
            try {
              const result = await onChangePassword?.({ currentPassword, newPassword })
              setSuccess(result?.message || 'Password updated successfully.')
              event.currentTarget.reset()
            } catch (err) {
              setError(err.message || 'Password update failed. Please check your current password.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <p className="font-semibold text-slate-900">Change Login Password</p>
          <div className="mt-3 space-y-3">
            <input
              name="currentPassword"
              type="password"
              placeholder="Current Password"
              className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
            <input
              name="newPassword"
              type="password"
              placeholder="New Password (at least 6 characters)"
              className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-emerald-600">{success}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {INFO_PANELS.map((panel) => {
          const isOpen = expanded === panel.key
          return (
            <button
              key={panel.key}
              type="button"
              onClick={() => setExpanded(isOpen ? null : panel.key)}
              className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:border-slate-200 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{panel.title}</p>
                <span className={`text-sm text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>›</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{panel.short}</p>
              {isOpen && (
                <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {panel.detail.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 shrink-0 text-slate-300">•</span>
                      <span className="leading-6">{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </button>
          )
        })}
      </section>
    </div>
  )
}
