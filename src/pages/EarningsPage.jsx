import { useState } from 'react'
import { RechargePage } from './RechargePage'
import { SectionTitle } from '../components/SectionTitle'

function withdrawTone(status) {
  if (status === '已通过' || status === 'approved') return 'bg-emerald-50 text-emerald-600'
  if (status === '已驳回' || status === 'rejected') return 'bg-red-50 text-red-600'
  return 'bg-blue-50 text-blue-600'
}

export function EarningsPage({
  platformData,
  verification,
  onCreateWithdraw,
  withdrawSubmitting,
  onSubmitRecharge,
  rechargeSubmitting,
}) {
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('withdraw') // 'withdraw' | 'recharge'
  const claimedTasks = platformData?.claimedTasks ?? []
  const withdrawRequests = platformData?.withdrawRequests ?? []
  const completedCount = claimedTasks.filter((item) => item.status === '已完成' || item.status === 'completed').length
  const reviewingCount = claimedTasks.filter((item) => item.status === '待审核' || item.status === 'under_review').length
  const withdrawable = platformData?.quickStats?.find((item) => item.label === 'Withdrawable')?.value ?? '$0'
  const withdrawableAmount = Number(String(withdrawable).replace(/[^\d.]/g, '')) || 0
  const approvedWithdraws = withdrawRequests.filter((item) => item.status === '已通过' || item.status === 'approved').length
  const rejectedWithdraws = withdrawRequests.filter((item) => item.status === '已驳回' || item.status === 'rejected').length
  const withdrawLocked = platformData?.withdrawProgress ? !platformData.withdrawProgress.met : false

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-[0_18px_40px_rgba(16,185,129,0.25)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Today Summary</p>
        <h2 className="mt-2 text-2xl font-semibold">Withdrawable Balance {withdrawable}</h2>
        <p className="mt-2 text-sm text-white/80">{completedCount} tasks completed, {reviewingCount} under review.</p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Available</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{withdrawable}</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Approved</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{approvedWithdraws}</p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Rejected</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{rejectedWithdraws}</p>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('withdraw')}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
            activeSection === 'withdraw' ? 'bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]' : 'bg-white text-slate-500 shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
          }`}
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('recharge')}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
            activeSection === 'recharge' ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]' : 'bg-white text-slate-500 shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
          }`}
        >
          Recharge
        </button>
      </div>

      {activeSection === 'withdraw' && (
        <>
          {/* Withdraw form */}
          <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Withdraw</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Create Withdrawal Request</h3>
            </div>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault()
                const isVerified = verification?.status === 'approved' || verification?.status === '已通过'
                if (!isVerified) { setError('Please complete real-name verification before withdrawing.'); return }
                if (withdrawLocked) { setError('Task score insufficient. Complete more tasks before withdrawing.'); return }
                const formData = new FormData(event.currentTarget)
                const amount = String(formData.get('amount') || '').trim()
                const accountType = String(formData.get('accountType') || '').trim()
                const bankName = String(formData.get('bankName') || '').trim()
                const accountNo = String(formData.get('accountNo') || '').trim()
                const numericAmount = Number(amount)
                if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) { setError('Please enter a valid withdrawal amount.'); return }
                if (numericAmount > withdrawableAmount) { setError('Withdrawal amount cannot exceed your current withdrawable balance.'); return }
                if (!accountNo) { setError('Please enter your payout account or wallet address.'); return }
                setError('')
                await onCreateWithdraw?.({ amount, accountType, bankName, accountNo })
                event.currentTarget.reset()
              }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input name="amount" placeholder="Amount, e.g. 88" className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                <select name="accountType" defaultValue="USDT" className="h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="USDT">USDT</option>
                  <option value="Alipay">Alipay</option>
                  <option value="Bank Card">Bank Card</option>
                </select>
              </div>
              <input name="bankName" placeholder="Bank name — leave blank for crypto" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <input name="accountNo" placeholder="Payout account / wallet address" className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              <button type="submit" disabled={withdrawSubmitting || withdrawLocked} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                {withdrawSubmitting ? 'Submitting...' : withdrawLocked ? 'Complete more tasks first' : 'Submit Withdrawal Request'}
              </button>
            </form>
          </section>

          {/* Withdrawal history */}
          <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Withdrawal Records</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Withdrawal History</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">{withdrawRequests.length} records</span>
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
                    {item.reviewedAt ? <p className="mt-2 text-xs text-slate-400">Reviewed at: {item.reviewedAt}</p> : null}
                    <p className="mt-2 text-sm text-slate-500">{item.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No withdrawal records yet.</div>
            )}
          </section>
        </>
      )}

      {activeSection === 'recharge' && (
        <RechargePage
          verification={verification}
          rechargeRequests={platformData?.rechargeRequests ?? []}
          rechargeSubmitting={rechargeSubmitting}
          onSubmitRecharge={onSubmitRecharge}
          supportLink={platformData?.supportLink}
        />
      )}
    </div>
  )
}
