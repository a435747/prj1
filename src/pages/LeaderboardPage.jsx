import { leaderboard as fallbackLeaderboard } from '../data/mock'
import { SectionTitle } from '../components/SectionTitle'

export function LeaderboardPage({ platformData, onRankClick }) {
  const ranking = platformData?.leaderboard ?? fallbackLeaderboard

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Top Earners</p>
        <h2 className="mt-2 text-2xl font-semibold">Weekly Earnings Board</h2>
        <p className="mt-2 text-sm text-white/65">Top users update in real time. The more approved tasks you finish, the higher you rank.</p>
      </section>

      <section>
        <SectionTitle eyebrow="Ranking" title="Live Ranking" />
        <div className="space-y-3">
          {ranking.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRankClick?.(item, index)}
              className="flex w-full items-center justify-between rounded-[26px] bg-white p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-sm font-bold text-[#f3c969]">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Earnings</p>
                <p className="text-lg font-bold text-amber-600">{item.amount}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
