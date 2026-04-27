function getStatusLabel(status) {
  if (status === '已完成' || status === 'completed') return 'Completed'
  if (status === '已驳回' || status === 'rejected') return 'Rejected'
  if (status === '待审核' || status === 'under_review') return 'Under Review'
  if (status === '待提交' || status === 'pending_proof') return 'Pending Shipping Info'
  if (status === '已通过' || status === 'approved') return 'Approved'
  return status || 'Unknown'
}

function StarRow({ rating }) {
  const filled = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`text-sm ${index < filled ? 'text-amber-400' : 'text-slate-300'}`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-medium text-slate-600">{rating}</span>
    </div>
  )
}

function getActionLabel(claim, submitting) {
  if (claim?.status === '已完成' || claim?.status === 'completed') return 'Completed'
  if (claim?.status === '待审核' || claim?.status === 'under_review') return 'Awaiting Review'
  if (claim?.status === '待提交' || claim?.status === 'pending_proof') return 'Submit Shipping Info'
  if (claim?.status === '已驳回' || claim?.status === 'rejected') return 'Resubmit Info'
  if (submitting) return 'Submitting...'
  return 'Grab Order'
}

export function TaskDetailCard({
  task,
  claim,
  submitting,
  onStart,
  onOpenProfile,
  onSubmitOrderInfo,
}) {
  if (!task) {
    return null
  }

  const canSubmitInfo = Boolean(
    claim && (
      claim.status === '待提交' ||
      claim.status === 'pending_proof' ||
      claim.status === '已驳回' ||
      claim.status === 'rejected'
    ),
  )

  const claimDisabled = Boolean(claim && claim.status !== '已驳回' && claim.status !== 'rejected') || submitting

  return (
    <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 p-[1px] shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
      <div className="rounded-[27px] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(task.verified ?? []).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600"
                >
                  {item}
                </span>
              ))}
              {claim ? (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  claim.status === '已完成' || claim.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600'
                    : claim.status === '已驳回' || claim.status === 'rejected'
                      ? 'bg-red-50 text-red-600'
                      : claim.status === '待审核' || claim.status === 'under_review'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                }`}>
                  {getStatusLabel(claim.status)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
            <p className="text-[11px] text-amber-500">Estimated Commission</p>
            <p className="text-lg font-bold text-amber-600">{task.commission}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{task.description}</p>

        <div className="mt-4">
          <StarRow rating={task.rating} />
        </div>

        <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>commission</span>
            <span className="font-semibold text-slate-900">{task.commission}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>estimated handling time</span>
            <span className="font-semibold text-slate-900">{task.time}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>shop / channel</span>
            <span className="font-semibold text-slate-900">{task.city} · {task.location}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 text-slate-600">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">shop name</p>
              <p className="mt-1 font-semibold text-slate-900">{task.shopName ?? task.location}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">sku</p>
              <p className="mt-1 font-semibold text-slate-900">{task.sku ?? '-'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">color</p>
              <p className="mt-1 font-semibold text-slate-900">{task.color ?? '-'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">size</p>
              <p className="mt-1 font-semibold text-slate-900">{task.size ?? '-'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">quantity</p>
              <p className="mt-1 font-semibold text-slate-900">{task.quantity ?? 1}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">category</p>
              <p className="mt-1 font-semibold text-slate-900">{task.type ?? '-'}</p>
            </div>
          </div>
          {claim?.summary ? (
            <div className="rounded-2xl bg-white p-3 text-slate-600">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">task status</p>
              <p className="mt-2 leading-6">{claim.summary}</p>
            </div>
          ) : null}
        </div>

        {canSubmitInfo ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const contactName = String(formData.get('contactName') || '').trim()
              const phone = String(formData.get('phone') || '').trim()
              const address = String(formData.get('address') || '').trim()
              if (!contactName || !phone || !address) return
              const payload = `Contact: ${contactName}\nPhone: ${phone}\nAddress: ${address}`
              await onSubmitOrderInfo?.(claim.id, payload)
            }}
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Shipping Information</p>
              <div className="mt-3 space-y-3">
                <input
                  name="contactName"
                  defaultValue={claim?.proofText?.match(/Contact:\s*(.*)/)?.[1] ?? ''}
                  placeholder="Contact person"
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  name="phone"
                  defaultValue={claim?.proofText?.match(/Phone:\s*(.*)/)?.[1] ?? ''}
                  placeholder="Phone number"
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={claim?.proofText?.match(/Address:\s*([\s\S]*)/)?.[1] ?? ''}
                  placeholder="Shipping address"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {getActionLabel(claim, submitting)}
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled={claimDisabled}
            onClick={() => {
              if (claim && claim.status !== '已驳回' && claim.status !== 'rejected') {
                onOpenProfile?.()
                return
              }
              onStart?.(task)
            }}
            className="mt-4 w-full rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {getActionLabel(claim, submitting)}
          </button>
        )}
      </div>
    </div>
  )
}
