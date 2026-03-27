import { useState } from 'react'
import { DataTable } from './DataTable'

const columns = [
  { key: 'status', label: 'Status' },
  { key: 'username', label: 'Username' },
  { key: 'amount', label: 'Amount' },
  { key: 'channel', label: 'Channel' },
  { key: 'txId', label: 'Transaction ID' },
  { key: 'createdAt', label: 'Submitted At' },
  { key: 'reviewedAt', label: 'Reviewed At' },
  { key: 'summary', label: 'Note' },
]

function statusLabel(status) {
  if (status === 'approved' || status === '已通过') return 'Approved'
  if (status === 'rejected' || status === '已驳回') return 'Rejected'
  return 'Under Review'
}

function statusClass(status) {
  if (status === 'approved' || status === '已通过') return 'bg-emerald-50 text-emerald-600'
  if (status === 'rejected' || status === '已驳回') return 'bg-red-50 text-red-600'
  return 'bg-amber-50 text-amber-600'
}

export function RechargeTable({ rows = [], page, onPageChange, processingId, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  return (
    <DataTable
      title="Recharge Management"
      columns={columns}
      rows={rows}
      page={page}
      onPageChange={onPageChange}
      renderCell={(row, col) => {
        if (col.key === 'status') {
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>
              {statusLabel(row.status)}
            </span>
          )
        }
        return String(row[col.key] ?? '--')
      }}
      renderActions={(row) => {
        const canReview = row.status === 'under_review' || row.status === '待审核'
        const isProcessing = processingId === row.id

        if (!canReview) return <span className="text-xs text-slate-400">{statusLabel(row.status)}</span>

        if (rejectingId === row.id) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason (optional)"
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={() => {
                  onReject?.(row, rejectReason)
                  setRejectingId(null)
                  setRejectReason('')
                }}
                className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => { setRejectingId(null); setRejectReason('') }}
                className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          )
        }

        return (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onApprove?.(row)}
              className="rounded-md bg-emerald-50 px-3 py-1 text-xs text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setRejectingId(row.id)}
              className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )
      }}
    />
  )
}
