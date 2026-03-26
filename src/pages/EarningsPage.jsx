import { useState } from 'react'
import { earningsFeed as fallbackFeed } from '../data/mock'
import { SectionTitle } from '../components/SectionTitle'

function withdrawTone(status) {
  if (status === '已通过') return 'bg-emerald-50 text-emerald-600'
  if (status === '已驳回') return 'bg-red-50 text-red-600'
  return 'bg-blue-50 text-blue-600'
}

export function EarningsPage({ platformData, onFeedClick, onCreateWithdraw, withdrawSubmitting }) {
  const [error, setError] = useState('')
  const feed = platformData?.earningsFeed ?? fallbackFeed
  const claimedTasks = platformData?.claimedTasks ?? []
  const withdrawRequests = platformData?.withdrawRequests ?? []
  const completedCount = claimedTasks.filter((item) => item.status === '已完成').length
  const reviewingCount = claimedTasks.filter((item) => item.status === '待审核').length
  const withdrawable = platformData?.quickStats?.find((item) => item.label === 'Withdrawable')?.value ?? '$0'
  const withdrawableAmount = Number(String(withdrawable).replace(/[^\d.]/g, '')) || 0

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-[0_18px_40px_rgba(16,185,129,0.25)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Today Summary</p>
        <h2 className="mt-2 text-2xl font-semibold">Withdrawable Balance {withdrawable}</h2>
        <p className="mt-2 text-sm text-white/80">{completedCount} tasks completed, {reviewingCount} under review.</p>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Withdraw</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Create Withdrawal Request</h3>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const amount = String(formData.get('amount') || '').trim()
            const accountType = String(formData.get('accountType') || '').trim()
            const accountNo = String(formData.get('accountNo') || '').trim()
            const numericAmount = Number(amount)

            if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
              setError('Please enter a valid withdrawal amount.')
              return
            }

            if (numericAmount > withdrawableAmount) {
              setError('Withdrawal amount cannot exceed your current withdrawable balance.')
              return
            }

            if (!accountNo) {
              setError('Please enter your payout account or wallet address.')
              return
            }

            setError('')
            await onCreateWithdraw?.({ amount, accountType, accountNo })
            event.currentTarget.reset()
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="amount"
              placeholder="Amount, e.g. 88"
              className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <select
              name="accountType"
              defaultValue="USDT"
              className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="USDT">USDT</option>
              <option value="Alipay">Alipay</option>
              <option value="Bank Card">Bank Card</option>
            </select>
          </div>
          <input
            name="accountNo"
            placeholder="Payout account / wallet address"
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={withdrawSubmitting}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {withdrawSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Withdrawal Records</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Withdrawal History</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {withdrawRequests.length} records
          </span>
        </div>

        {withdrawRequests.length ? (
          <div className="space-y-3">
            {withdrawRequests.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.amount}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.createdAt} · {item.accountType}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${withdrawTone(item.status)}`}>
                    {item.status === '已通过' ? 'Approved' : item.status === '已驳回' ? 'Rejected' : 'Reviewing'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.accountNo}</p>
                <p className="mt-2 text-sm text-slate-500">{item.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No withdrawal records yet.
          </div>
        )}
      </section>

      <SectionTitle eyebrow="Feed" title="Earnings Feed" />

      {feed.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onFeedClick?.(item)}
          className="block w-full rounded-[28px] bg-white p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
        >
          <div className="flex items-center gap-3">
            <img src={item.avatar} alt={item.user} className="h-12 w-12 rounded-2xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{item.user}</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {item.amount}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">earned today</p>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-[24px]">
            <img src={item.image} alt={item.text} className="h-44 w-full object-cover" />
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
        </button>
      ))}
    </div>
  )
}
