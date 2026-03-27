import { useState } from 'react'

function statusTone(status) {
  if (status === '已通过' || status === 'approved') return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (status === '已驳回' || status === 'rejected') return 'text-red-600 bg-red-50 border-red-200'
  return 'text-amber-600 bg-amber-50 border-amber-200'
}

function statusLabel(status) {
  if (status === '已通过' || status === 'approved') return 'Approved'
  if (status === '已驳回' || status === 'rejected') return 'Rejected'
  if (status === '待认证' || status === 'not_verified') return 'Not Verified'
  return 'Under Review'
}

export function RealNamePage({ verification, onSubmit }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const status = verification?.status || 'not_verified'
  const canResubmit = !verification || verification.status === '已驳回' || verification.status === 'rejected'

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-700 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Identity</p>
        <h4 className="mt-2 text-xl font-semibold">Real-Name Verification Center</h4>
        <p className="mt-2 text-sm text-white/80">Complete verification to improve account security and unlock higher withdrawal limits.</p>
      </section>

      <section className="space-y-3 rounded-[24px] bg-slate-50 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Status</p>
              <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusTone(status)}`}>
                {statusLabel(status)}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Review Result</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{verification?.reviewedAt || 'Waiting for review'}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{verification?.summary || 'Fill in the information below and submit it for review.'}</p>
          {verification ? (
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Real Name</p>
                <p className="mt-1 font-medium text-slate-800">{verification.realName || '--'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Account Name</p>
                <p className="mt-1 font-medium text-slate-800">{verification.accountName || '--'}</p>
              </div>
            </div>
          ) : null}
        </div>

        <form
          className="space-y-3 rounded-2xl bg-white p-4 shadow-sm"
          onSubmit={async (event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const payload = {
              realName: String(formData.get('realName') || '').trim(),
              idCard: String(formData.get('idCard') || '').trim(),
              accountName: String(formData.get('accountName') || '').trim(),
            }

            if (payload.realName.length < 2) {
              setError('Real name must be at least 2 characters.')
              return
            }

            if (!/^[\dXx]{15,18}$/.test(payload.idCard)) {
              setError('Please enter a valid ID number.')
              return
            }

            if (payload.accountName.length < 2) {
              setError('Account holder name must be at least 2 characters.')
              return
            }

            setSubmitting(true)
            setError('')
            try {
              await onSubmit?.(payload)
            } catch (err) {
              setError(err.message || 'Submission failed.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Submit Verification Info</p>
            <span className="text-xs text-slate-400">Real information will be used for withdrawal review</span>
          </div>
          <input name="realName" defaultValue={verification?.realName || ''} placeholder="Full Name" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" />
          <input name="idCard" defaultValue={verification?.idCard || ''} placeholder="ID Number" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" />
          <input name="accountName" defaultValue={verification?.accountName || ''} placeholder="Payout Account Name" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button type="submit" disabled={submitting || !canResubmit} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Submitting...' : canResubmit ? 'Submit Verification' : 'Under Review, Resubmission Disabled'}
          </button>
        </form>
      </section>
    </div>
  )
}
