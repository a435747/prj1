export function SupportPage({ supportLink }) {
  const finalLink = supportLink || 'https://t.me/your_support_handle'

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/50">Customer Service</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Need help? Contact support directly</h2>
        <p className="mt-3 text-sm leading-6 text-white/75">
          For recharge, withdrawal, task review, account issues, or verification help, open customer service directly.
        </p>
        <a
          href={finalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#f3c969] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 active:scale-[0.98]"
        >
          Open Customer Service
        </a>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Support Link</p>
        <p className="mt-2 break-all text-sm leading-6 text-slate-600">{finalLink}</p>
      </section>
    </div>
  )
}
