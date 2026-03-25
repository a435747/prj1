import { leaderboard as fallbackLeaderboard } from '../data/mock'
import { SectionTitle } from '../components/SectionTitle'

export function LeaderboardPage({ platformData }) {
  const ranking = platformData?.leaderboard ?? fallbackLeaderboard

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Top Earners</p>
        <h2 className="mt-2 text-2xl font-semibold">本周收益榜</h2>
        <p className="mt-2 text-sm text-white/65">高收益用户实时更新，完成任务越多，排名越高。</p>
      </section>

      <section>
        <SectionTitle eyebrow="Ranking" title="实时排行" />
        <div className="space-y-3">
          {ranking.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[26px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)]"
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
                <p className="text-xs text-slate-400">累计收益</p>
                <p className="text-lg font-bold text-amber-600">{item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
