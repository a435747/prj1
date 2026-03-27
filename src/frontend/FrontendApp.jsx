import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { DetailSheet } from '../components/DetailSheet'
import { tabs } from '../data/mock'
import { EarningsPage } from '../pages/EarningsPage'
import { HomePage } from '../pages/HomePage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RealNamePage } from '../pages/RealNamePage'
import { SecurityCenterPage } from '../pages/SecurityCenterPage'
import { TasksPage } from '../pages/TasksPage'

function isRejectedStatus(status) {
  return status === '已驳回' || status === 'rejected'
}

export function FrontendApp({
  platformData,
  onClaimTask,
  onSubmitTaskProof,
  onCreateWithdrawRequest,
  onLogout,
  frontendUser,
  onSubmitVerification,
  onChangeFrontendPassword,
}) {
  const [activeTab, setActiveTab] = useState('home')
  const [notice, setNotice] = useState('')
  const [submittingTaskId, setSubmittingTaskId] = useState(null)
  const [proofSubmittingId, setProofSubmittingId] = useState(null)
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
  const [detail, setDetail] = useState(null)

  const title = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.title ?? 'Home',
    [activeTab],
  )

  const showNotice = (message) => {
    setNotice(message)
    window.clearTimeout(window.__frontendNoticeTimer)
    window.__frontendNoticeTimer = window.setTimeout(() => setNotice(''), 2200)
  }

  const handleOpenTask = (task) => {
    setActiveTab('tasks')
    showNotice(`Opened task: ${task.title}`)
  }

  const handleStartTask = async (task) => {
    if (submittingTaskId === task.id) return

    const exists = (platformData.claimedTasks ?? []).some(
      (item) => item.taskId === task.id && !isRejectedStatus(item.status),
    )

    if (exists) {
      setActiveTab('profile')
      showNotice(`You already claimed: ${task.title}. Check progress in Profile.`)
      return
    }

    try {
      setSubmittingTaskId(task.id)
      await onClaimTask?.(task.id)
      setActiveTab('profile')
      showNotice(`Task claimed successfully: ${task.title}`)
    } catch (error) {
      showNotice(error.message || 'Failed to claim task. Please try again later.')
    } finally {
      setSubmittingTaskId(null)
    }
  }

  const handleSubmitProof = async (claimId, proofText) => {
    if (proofSubmittingId === claimId) return

    try {
      setProofSubmittingId(claimId)
      await onSubmitTaskProof?.(claimId, proofText)
      showNotice('Proof submitted successfully. Waiting for review.')
    } catch (error) {
      showNotice(error.message || 'Submission failed. Please try again later.')
      throw error
    } finally {
      setProofSubmittingId(null)
    }
  }

  const handleCreateWithdraw = async (payload) => {
    if (withdrawSubmitting) return

    try {
      setWithdrawSubmitting(true)
      await onCreateWithdrawRequest?.(payload)
      showNotice('Withdrawal request submitted. Waiting for review.')
    } catch (error) {
      showNotice(error.message || 'Withdrawal request failed. Please try again later.')
      throw error
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  const handleProfileMenu = (label) => {
    if (label === 'Task Records') {
      setActiveTab('tasks')
      showNotice('Task Hall opened.')
      return
    }

    if (label === 'Withdrawal Records') {
      setActiveTab('earnings')
      showNotice('Earnings page opened.')
      return
    }

    if (label === 'Real-Name Verification') {
      setDetail({ title: 'Real-Name Verification', subtitle: 'Identity and withdrawal permissions', content: 'real-name' })
      return
    }

    if (label === 'Security Center') {
      setDetail({ title: 'Security Center', subtitle: 'Account protection and risk alerts', content: 'security' })
      return
    }

    setActiveTab('profile')
    showNotice(`Returned to Profile: ${label}`)
  }

  const handleQuickAction = (label) => {
    if (label === 'Completed') {
      setActiveTab('profile')
      showNotice('Opened your task records.')
      return
    }

    if (label === 'Withdrawable' || label === 'Balance') {
      setActiveTab('earnings')
      showNotice('Opened earnings and withdrawal page.')
      return
    }

    setActiveTab('home')
    showNotice(`Focused on dashboard item: ${label}`)
  }

  const renderDetailContent = () => {
    if (!detail) return null
    if (detail.content === 'real-name') {
      return (
        <RealNamePage
          verification={frontendUser?.verification}
          onSubmit={async (payload) => {
            const result = await onSubmitVerification?.(payload)
            showNotice(result?.message || 'Verification submitted successfully.')
          }}
        />
      )
    }
    if (detail.content === 'security') {
      return (
        <SecurityCenterPage
          onChangePassword={async (body) => {
            const result = await onChangeFrontendPassword?.(body)
            showNotice(result?.message || 'Password updated successfully.')
            return result
          }}
        />
      )
    }
    if (detail.content === 'rank') {
      return (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{detail.item?.name}</p>
            <p className="mt-2 text-sm text-slate-500">Level: {detail.item?.level}</p>
            <p className="mt-2 text-sm text-slate-500">Total Earnings: {detail.item?.amount}</p>
          </div>
          <p className="text-sm leading-6 text-slate-500">This user has a high completion rate this week. Rankings update based on approved tasks and total earnings.</p>
        </div>
      )
    }

    if (detail.content === 'feed') {
      return (
        <div className="space-y-4">
          <img src={detail.item?.image} alt={detail.item?.text} className="h-52 w-full rounded-[24px] object-cover" />
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{detail.item?.user}</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">{detail.item?.amount}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{detail.item?.text}</p>
          </div>
        </div>
      )
    }

    return null
  }

  const renderPage = () => {
    const username = frontendUser?.username ?? platformData?.profile?.name ?? 'User'
    const mergedPlatformData = {
      ...platformData,
      profile: platformData?.profile
        ? {
            ...platformData.profile,
            name: `Premium Member · ${username}`,
            subtitle: `${username} · ${(platformData.claimedTasks ?? []).length} tasks claimed`,
          }
        : platformData?.profile,
    }

    switch (activeTab) {
      case 'tasks':
        return (
          <TasksPage
            platformData={mergedPlatformData}
            onOpenTask={handleOpenTask}
            onStartTask={handleStartTask}
            onOpenProfile={() => {
              setActiveTab('profile')
              showNotice('Opened Profile. Check your task records for details.')
            }}
            submittingTaskId={submittingTaskId}
          />
        )
      case 'earnings':
        return (
          <EarningsPage
            platformData={mergedPlatformData}
            withdrawSubmitting={withdrawSubmitting}
            onCreateWithdraw={handleCreateWithdraw}
            onFeedClick={(item) => setDetail({ title: `${item.user} Earnings`, subtitle: 'Earnings detail', content: 'feed', item })}
          />
        )
      case 'leaderboard':
        return (
          <LeaderboardPage
            platformData={mergedPlatformData}
            onRankClick={(item, index) => setDetail({ title: `Rank #${index + 1}`, subtitle: 'Ranking detail', content: 'rank', item })}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            platformData={mergedPlatformData}
            onMenuClick={handleProfileMenu}
            onQuickAction={handleQuickAction}
            onSubmitProof={handleSubmitProof}
            proofSubmittingId={proofSubmittingId}
            onLogout={onLogout}
          />
        )
      case 'home':
      default:
        return (
          <HomePage
            platformData={mergedPlatformData}
            onOpenTaskList={() => {
              setActiveTab('tasks')
              showNotice('Switched to Task Hall.')
            }}
            onOpenTask={handleOpenTask}
            onQuickAction={handleQuickAction}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(212,166,79,0.18),transparent_30%),linear-gradient(180deg,#050505_0_128px,#f6f7f8_128px_100%)]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-transparent">
        <Header title={title} />

        <main className="px-4 pb-28 pt-24">
          {notice ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-[0_10px_24px_rgba(245,158,11,0.12)]">
              {notice}
            </div>
          ) : null}
          <div className="min-h-[calc(100vh-10rem)]">{renderPage()}</div>
        </main>

        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {detail ? (
        <DetailSheet title={detail.title} subtitle={detail.subtitle} onClose={() => setDetail(null)}>
          {renderDetailContent()}
        </DetailSheet>
      ) : null}
    </div>
  )
}
