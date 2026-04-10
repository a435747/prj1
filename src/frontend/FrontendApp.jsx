import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { DetailSheet } from '../components/DetailSheet'
import { tabs } from '../data/mock'
import { EarningsPage } from '../pages/EarningsPage'
import { HomePage } from '../pages/HomePage'
import { ProfilePage } from '../pages/ProfilePage'
import { RealNamePage } from '../pages/RealNamePage'
import { RechargePage } from '../pages/RechargePage'
import { SecurityCenterPage } from '../pages/SecurityCenterPage'
import { SupportPage } from '../pages/SupportPage'
import { TasksPage } from '../pages/TasksPage'
import { VipPage } from '../pages/VipPage'

function isRejectedStatus(status) {
  return status === '已驳回' || status === 'rejected'
}

export function FrontendApp({
  platformData,
  onClaimTask,
  onSubmitTaskProof,
  onCreateWithdrawRequest,
  onCreateRechargeRequest,
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
  const [rechargeSubmitting, setRechargeSubmitting] = useState(false)
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
    const isVerified = frontendUser?.verification?.status === 'approved' || frontendUser?.verification?.status === '已通过'
    if (!isVerified) {
      setDetail({ title: 'Real-Name Verification', subtitle: 'Required before withdrawal', content: 'real-name' })
      showNotice('Please complete real-name verification before withdrawing.')
      return
    }
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

  const handleCreateRecharge = async (payload) => {
    if (rechargeSubmitting) return
    try {
      setRechargeSubmitting(true)
      await onCreateRechargeRequest?.(payload)
      showNotice('Recharge request submitted. Admin will approve shortly.')
    } catch (error) {
      showNotice(error.message || 'Recharge request failed. Please try again later.')
      throw error
    } finally {
      setRechargeSubmitting(false)
    }
  }

  const handleProfileMenu = (label) => {
    if (label === 'Task Records') {
      setActiveTab('task-center')
      showNotice('Task center opened.')
      return
    }

    if (label === 'Withdrawal Records') {
      setActiveTab('earnings')
      showNotice('Earnings page opened.')
      return
    }

    if (label === 'Recharge') {
      setActiveTab('earnings')
      showNotice('Recharge center opened.')
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
      setActiveTab('task-center')
      showNotice('Opened your task records.')
      return
    }

    if (label === 'Withdrawable' || label === 'Balance' || label === 'Withdraw') {
      setActiveTab('earnings')
      showNotice('Opened earnings and withdrawal page.')
      return
    }

    if (label === 'Recharge') {
      setActiveTab('earnings')
      showNotice('Recharge center opened.')
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

    if (detail.content === 'recharge') {
      return (
        <RechargePage
          verification={frontendUser?.verification}
          rechargeRequests={platformData?.rechargeRequests ?? []}
          rechargeSubmitting={rechargeSubmitting}
          onSubmitRecharge={handleCreateRecharge}
          supportLink={platformData?.supportLink}
        />
      )
    }

    if (detail.content === 'security') {
      return (
        <SecurityCenterPage
          frontendUser={frontendUser}
          onChangePassword={async (body) => {
            const result = await onChangeFrontendPassword?.(body)
            showNotice(result?.message || 'Password updated successfully.')
            setDetail(null)
            return result
          }}
        />
      )
    }

    if (detail.content === 'vip') {
      return <VipPage frontendUser={frontendUser} />
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
            mode="claim"
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
      case 'task-center':
        return (
          <TasksPage
            mode="view"
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
            verification={frontendUser?.verification}
            withdrawSubmitting={withdrawSubmitting}
            onCreateWithdraw={handleCreateWithdraw}
            onSubmitRecharge={handleCreateRecharge}
            rechargeSubmitting={rechargeSubmitting}
          />
        )
      case 'support':
        return <SupportPage supportLink={mergedPlatformData?.supportLink} />
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
        <Header
          title={title}
          onVipClick={() => setDetail({ title: 'VIP Access', subtitle: 'Membership levels & benefits', content: 'vip' })}
          supportLink={platformData?.supportLink}
        />

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
