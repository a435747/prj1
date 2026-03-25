import { profileStats } from '../data/mock'

const fallbackMenus = ['提现记录', '任务明细', '实名认证', '安全中心']

export function ProfilePage({ platformData }) {
  const profile = platformData?.profile ?? {
    name: '高级会员 · Aurora',
    subtitle: '已连续活跃 29 天',
    stats: profileStats,
    menus: fallbackMenus,
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-[20px] bg-gradient-to-br from-[#f3c969] to-[#d4a64f]" />
          <div>
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-white/60">{profile.subtitle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {profile.stats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/8 p-3 text-center">
              <p className="text-[11px] text-white/50">{item.label}</p>
              <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        {(profile.menus ?? fallbackMenus).map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <span>{item}</span>
            <span className="text-slate-300">›</span>
          </button>
        ))}
      </section>
    </div>
  )
}
