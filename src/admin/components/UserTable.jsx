import { useState } from 'react'
import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Username' },
  { key: 'nickname', label: 'Nickname' },
  { key: 'phone', label: 'Phone' },
  { key: 'region', label: 'Region' },
  { key: 'inviteCode', label: 'Invite Code' },
  { key: 'invitedBy', label: 'Invited By' },
  { key: 'frozen', label: 'Status' },
  { key: 'verification', label: 'Verification' },
  { key: 'createdAt', label: 'Registered At' },
]

export function UserTable({ rows = [], page, onPageChange, onFreezeUser, onEditUser, processingId }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ username: '', nickname: '', phone: '', region: '' })

  return (
    <DataTable
      title="User Management"
      description="View and manage frontend user accounts, contact information, invite relations, and risk status."
      columns={columns}
      rows={rows}
      page={page}
      onPageChange={onPageChange}
      renderCell={(row, col) => {
        if (col.key === 'frozen') {
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.frozen ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {row.frozen ? 'Frozen' : 'Active'}
            </span>
          )
        }
        if (col.key === 'verification') {
          const s = String(row.verification ?? 'none')
          const ok = s === 'approved' || s === '已通过'
          const rej = s === 'rejected' || s === '已驳回'
          return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              ok ? 'bg-emerald-50 text-emerald-600' : rej ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {ok ? 'Verified' : rej ? 'Rejected' : s === 'none' ? 'Not submitted' : 'Under review'}
            </span>
          )
        }
        return String(row[col.key] ?? '--')
      }}
      renderActions={(row) => {
        const isProcessing = processingId === row.id

        if (editingId === row.id) {
          return (
            <div className="grid min-w-[220px] gap-2">
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nickname: e.target.value }))}
                placeholder="Nickname"
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone"
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={editForm.region}
                onChange={(e) => setEditForm((prev) => ({ ...prev, region: e.target.value }))}
                placeholder="Region"
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-400"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing || !editForm.username.trim()}
                  onClick={() => {
                    onEditUser?.(row.id, editForm)
                    setEditingId(null)
                  }}
                  className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setEditingId(row.id)
                setEditForm({
                  username: row.username ?? '',
                  nickname: row.nickname ?? '',
                  phone: row.phone ?? '',
                  region: row.region ?? '',
                })
              }}
              className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onFreezeUser?.(row.id, row.frozen ? 'unfreeze' : 'freeze')}
              className={`rounded-md px-3 py-1 text-xs transition disabled:opacity-50 ${
                row.frozen
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
            >
              {isProcessing ? '...' : row.frozen ? 'Unfreeze' : 'Freeze'}
            </button>
          </div>
        )
      }}
    />
  )
}
