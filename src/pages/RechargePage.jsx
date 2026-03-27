import { useState } from 'react'

const STEPS = [
  { icon: '💬', label: 'Contact customer service', desc: 'Open the chat below and tell the agent your desired top-up amount.' },
  { icon: '💳', label: 'Make the payment', desc: 'Follow the agent\'s instructions to complete the payment via the assigned method.' },
  { icon: '✅', label: 'Submit recharge request', desc: 'Fill in the form below after payment. Admin will approve and credit your balance.' },
]

export function RechargePage({ verification, onSubmitRecharge, rechargeSubmitting, rechargeRequests = [], supportLink }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isVerified = verification?.status === 'approved' || verification?.status === '已通过'

  function rechargeTone(status) {
    if (status === 'approved' || status === '已通过') return 'bg-emerald-50 text-emerald-600'
    if (status === 'rejected' || status === '已驳回') return 'bg-red-50 text-red-600'
    return 'bg-blue-50 text-blue-600'
  }

  function rechargeLabel(status) {
    if (status === 'approved' || status === '已通过') return 'Approved'
    if (status === 'rejected' || status === '已驳回') return 'Rejected'
    return 'Under Review'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Top Up</p>
        <h4 className="mt-2 text-xl font-semibold">Recharge Center</h4>
        <p className="mt-2 text-sm text-white/80">Contact customer service to top up your balance. Funds are credited after admin approval.</p>
      </section>

      {/* Verification gate */}
      {!isVerified && (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-semibold">Real-name verification required</p>
          <p className="mt-1 leading-6">You must complete identity verification before you can submit a recharge request. Go to Profile → Real-Name Verification.</p>
        </div>
      )}

      {/* Steps */}
      <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">How It Works</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">3 Simple Steps</h3>
        <div className="mt-3 space-y-3">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">{step.icon}</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{i + 1}. {step.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer service chat */}
      <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Support</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">Contact Customer Service</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Our agents are available. Start a chat to get your top-up account details and confirm the amount.</p>
        <a
          href={supportLink || 'https://t.me/your_support_handle'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.97]"
        >
          <span>💬</span>
          <span>Chat with Customer Service</span>
        </a>
      </section>

      {/* Submit recharge form */}
      <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Submit</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">Submit Recharge Request</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">After payment, fill in the details below. Admin will verify and credit your balance within the review period.</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!isVerified) {
              setError('Please complete real-name verification first.')
              return
            }
            const formData = new FormData(event.currentTarget)
            const amount = String(formData.get('amount') || '').trim()
            const txId = String(formData.get('txId') || '').trim()
            const channel = String(formData.get('channel') || '').trim()
            if (!amount || Number(amount) <= 0) {
              setError('Please enter a valid amount.')
              return
            }
            if (!txId) {
              setError('Please enter the transaction ID or reference number.')
              return
            }
            setError('')
            setSuccess('')
            try {
              await onSubmitRecharge?.({ amount, txId, channel })
              setSuccess('Recharge request submitted. Admin will approve shortly.')
              event.currentTarget.reset()
            } catch (err) {
              setError(err.message || 'Submission failed. Please try again.')
            }
          }}
        >
          <input
            name="amount"
            type="number"
            min="1"
            placeholder="Amount (e.g. 100)"
            disabled={!isVerified}
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
          <select
            name="channel"
            disabled={!isVerified}
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          >
            <option value="USDT">USDT (TRC20)</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Alipay">Alipay</option>
          </select>
          <input
            name="txId"
            placeholder="Transaction ID / Reference No."
            disabled={!isVerified}
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <button
            type="submit"
            disabled={rechargeSubmitting || !isVerified}
            className="w-full rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rechargeSubmitting ? 'Submitting...' : 'Submit Recharge Request'}
          </button>
        </form>
      </section>

      {/* Recharge history */}
      <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">History</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Recharge Records</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">{rechargeRequests.length} records</span>
        </div>
        {rechargeRequests.length ? (
          <div className="space-y-3">
            {rechargeRequests.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">${item.amount}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.createdAt} · {item.channel}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rechargeTone(item.status)}`}>
                    {rechargeLabel(item.status)}
                  </span>
                </div>
                {item.txId ? <p className="mt-2 text-xs text-slate-400">Ref: {item.txId}</p> : null}
                {item.summary ? <p className="mt-2 text-sm text-slate-500">{item.summary}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No recharge records yet.
          </div>
        )}
      </section>
    </div>
  )
}
