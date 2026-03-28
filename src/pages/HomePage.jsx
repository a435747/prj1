import { useEffect, useState } from 'react'
import { defaultBannerSlides } from '../shared/platformData'
import { SectionTitle } from '../components/SectionTitle'

function BannerCarousel({ slides }) {
  const [current, setCurrent] = useState(0)
  const list = slides && slides.length > 0 ? slides : defaultBannerSlides

  useEffect(() => {
    if (list.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % list.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [list.length])

  const goTo = (index) => setCurrent(index)
  const slide = list[current]

  return (
    <div className="relative overflow-hidden rounded-[28px] shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
      <div className="relative h-48 w-full">
        <img
          key={slide.id ?? current}
          src={slide.image}
          alt={slide.title}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f3c969]/80">{slide.subtitle}</p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-white">{slide.title}</h2>
        </div>
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-[#f3c969]' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HomePage({ platformData, onQuickAction }) {
  const { homeStats, tickerItems, quickStats } = platformData
  const bannerSlides = platformData?.bannerSlides ?? defaultBannerSlides

  const baseOnline = Number(String(homeStats[1]?.value ?? '18426').replace(/[^\d]/g, '')) || 18426
  const [onlineCount, setOnlineCount] = useState(() => baseOnline + Math.floor(Math.random() * 800) - 400)

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => Math.max(100, prev + Math.floor(Math.random() * 60) - 20))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const displayStats = homeStats.map((item, i) =>
    i === 1 ? { ...item, value: onlineCount.toLocaleString() } : item,
  )

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-black via-slate-900 to-zinc-800 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
        <div className="grid grid-cols-2 gap-3">
          {displayStats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAction?.(item.label)}
              className="rounded-3xl bg-white/8 p-3 text-left backdrop-blur-sm transition hover:bg-white/12 active:scale-[0.98]"
            >
              <p className="text-xs text-white/60">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-[#f3c969]">{item.sub}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
          <div className="flex w-max min-w-full gap-8 whitespace-nowrap text-sm text-white/80 animate-marquee">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <BannerCarousel slides={bannerSlides} />

      <section>
        <SectionTitle eyebrow="Account" title="Quick Stats" />
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAction?.(item.label)}
              className="rounded-[24px] bg-white p-3 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(15,23,42,0.14)] active:scale-[0.98]"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
