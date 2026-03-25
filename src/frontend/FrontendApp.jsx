import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { tabs } from '../data/mock'
import { EarningsPage } from '../pages/EarningsPage'
import { HomePage } from '../pages/HomePage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { TasksPage } from '../pages/TasksPage'

export function FrontendApp({ onSwitchToAdmin, platformData }) {
  const [activeTab, setActiveTab] = useState('home')

  const title = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.title ?? '首页',
    [activeTab],
  )

  const renderPage = () => {
    switch (activeTab) {
      case 'tasks':
        return <TasksPage platformData={platformData} />
      case 'earnings':
        return <EarningsPage platformData={platformData} />
      case 'leaderboard':
        return <LeaderboardPage platformData={platformData} />
      case 'profile':
        return <ProfilePage platformData={platformData} />
      case 'home':
      default:
        return <HomePage platformData={platformData} />
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(212,166,79,0.18),transparent_30%),linear-gradient(180deg,#050505_0_128px,#f6f7f8_128px_100%)]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-transparent">
        <Header title={title} />

        <button
          type="button"
          onClick={onSwitchToAdmin}
          className="fixed right-4 top-20 z-50 rounded-full bg-[#f3c969] px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 active:scale-95"
        >
          进入后台
        </button>

        <main className="px-4 pb-28 pt-24">
          <div className="min-h-[calc(100vh-10rem)]">{renderPage()}</div>
        </main>

        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
