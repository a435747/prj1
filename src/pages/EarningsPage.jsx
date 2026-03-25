import { earningsFeed as fallbackFeed } from '../data/mock'
import { SectionTitle } from '../components/SectionTitle'

export function EarningsPage({ platformData }) {
  const feed = platformData?.earningsFeed ?? fallbackFeed

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Feed" title="Earnings Feed" />

      {feed.map((item) => (
        <article
          key={item.id}
          className="rounded-[28px] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
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
        </article>
      ))}
    </div>
  )
}
