import { useEffect, useState } from 'react'

export function RejectReasonModal({ open, title = '填写驳回原因', initialValue = '', confirmText = '确认驳回', onClose, onConfirm }) {
  const [reason, setReason] = useState(initialValue)

  useEffect(() => {
    setReason(initialValue)
  }, [initialValue, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Reject Flow</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">请输入明确、可回传给前台用户的驳回原因。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-200"
          >
            关闭
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={6}
            placeholder="例如：证件信息不清晰，请上传清晰无遮挡的证件照片。"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>建议填写具体原因，减少重复提交。</span>
            <span>{reason.length} 字</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              if (!reason.trim()) return
              onConfirm(reason.trim())
            }}
            disabled={!reason.trim()}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
