import { useCallback, useEffect, useState } from 'react'
import { AdminDashboard } from './admin/AdminDashboard'
import { LoginPage } from './admin/LoginPage'
import { FrontendApp } from './frontend/FrontendApp'
import { FrontendAuthPage } from './frontend/FrontendAuthPage'
import { api } from './lib/api'
import { Toast } from './components/Toast'
import { initialPlatformData, derivePlatformData } from './shared/platformData'

function getInitialView() {
  return window.location.pathname.startsWith('/admin') ? 'admin' : 'frontend'
}

function syncPathname(view) {
  const nextPath = view === 'admin' ? '/admin' : '/'
  if (window.location.pathname !== nextPath) {
    window.history.replaceState(null, '', nextPath)
  }
}

function App() {
  const [view, setView] = useState(getInitialView)
  const [platformData, setPlatformData] = useState(initialPlatformData)
  const [adminData, setAdminData] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [frontendUser, setFrontendUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [frontendToken, setFrontendToken] = useState(() => localStorage.getItem('frontend_token') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((title, message = '', type = 'success') => {
    setToast({ title, message, type })
  }, [])

  const refreshAdminData = useCallback(async (currentToken) => {
    const [data, currentUser] = await Promise.all([api.getAdminData(currentToken), api.getAdminUser(currentToken)])
    setAdminData(data)
    setAdminUser(currentUser.user)
  }, [])

  const refreshFrontendData = useCallback(async (currentToken) => {
    const [platform, me] = await Promise.all([api.getPlatform(currentToken), api.getFrontendUser(currentToken)])
    setPlatformData(derivePlatformData(platform))
    setFrontendUser(me.user)
  }, [])

  useEffect(() => {
    syncPathname(view)
  }, [view])

  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        if (frontendToken) {
          await refreshFrontendData(frontendToken)
        } else {
          const platform = await api.getPlatform()
          if (!cancelled) {
            setPlatformData(derivePlatformData(platform))
          }
        }
        if (!cancelled) setError('')
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [frontendToken, refreshFrontendData])

  useEffect(() => {
    if (!token) {
      setAdminData(null)
      setAdminUser(null)
      localStorage.removeItem('admin_token')
      return
    }

    localStorage.setItem('admin_token', token)

    let cancelled = false
    refreshAdminData(token).catch(() => {
      if (!cancelled) {
        setToken('')
        setAdminData(null)
        setAdminUser(null)
        showToast('Session expired', 'Please sign in to the admin panel again.', 'error')
      }
    })

    return () => {
      cancelled = true
    }
  }, [token, refreshAdminData, showToast])

  useEffect(() => {
    if (!frontendToken) {
      setFrontendUser(null)
      localStorage.removeItem('frontend_token')
      return
    }

    localStorage.setItem('frontend_token', frontendToken)

    let cancelled = false
    refreshFrontendData(frontendToken).catch(() => {
      if (!cancelled) {
        setFrontendToken('')
        setFrontendUser(null)
        showToast('Session expired', 'Please sign in again.', 'error')
      }
    })

    return () => {
      cancelled = true
    }
  }, [frontendToken, refreshFrontendData, showToast])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-slate-500">Loading...</div>
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-red-500">{error}</div>
  }

  if (view === 'admin' && !token) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginPage
          onBack={() => setView('frontend')}
          onLogin={async (form) => {
            const result = await api.adminLogin(form)
            setToken(result.token)
            setAdminUser(result.user)
            showToast('Login successful', `Welcome back, ${result.user.username}.`)
          }}
        />
      </>
    )
  }

  if (view === 'frontend' && !frontendToken) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <FrontendAuthPage
          onLogin={async (form) => {
            const result = await api.loginFrontendUser(form)
            setFrontendToken(result.token)
            setFrontendUser(result.user)
            await refreshFrontendData(result.token)
            showToast('Login successful', `Welcome back, ${result.user.username}.`)
          }}
          onRegister={async (form) => {
            const result = await api.registerFrontendUser(form)
            setFrontendToken(result.token)
            setFrontendUser(result.user)
            await refreshFrontendData(result.token)
            showToast('Registration successful', `Account created for ${result.user.username}.`)
          }}
        />
      </>
    )
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {view === 'admin' ? (
        <AdminDashboard
          adminData={adminData}
          adminUsername={adminUser?.username}
          platformData={platformData}
          onSavePlatform={async (nextPlatform) => {
            const saved = await api.savePlatform(token, nextPlatform)
            setPlatformData(derivePlatformData(saved))
            showToast('Saved successfully', 'Frontend content has been synced to the server.')
          }}
          onReviewTaskClaim={async (claimId, action) => {
            const result = await api.reviewTaskClaim(token, claimId, action)
            setPlatformData(derivePlatformData(result.platformData))
            setAdminData(result.adminData)
            showToast(action === 'approve' ? 'Review approved' : 'Rejected', result.message)
          }}
          onReviewWithdraw={async (requestId, action) => {
            const result = await api.reviewWithdrawRequest(token, requestId, action)
            setPlatformData(derivePlatformData(result.platformData))
            setAdminData(result.adminData)
            showToast(action === 'approve' ? 'Withdrawal approved' : 'Withdrawal rejected', result.message)
          }}
          onReviewVerification={async (verificationId, action, reason = '') => {
            const result = await api.reviewVerification(token, verificationId, action, reason)
            setAdminData((prev) => ({ ...(prev ?? {}), ...result.adminData }))
            if (frontendToken) await refreshFrontendData(frontendToken)
            showToast(action === 'approve' ? 'Verification approved' : 'Verification rejected', result.message)
          }}
          onChangePassword={async (body) => {
            const result = await api.changePassword(token, body)
            showToast('Password updated', 'Use the new password next time you sign in.')
            return result
          }}
          onChangeAccount={async (body) => {
            const result = await api.changeAccount(token, body)
            setAdminUser(result.user)
            showToast('Account updated', `Current admin: ${result.user.username}`)
            return result
          }}
          onLogout={() => {
            setToken('')
            setAdminUser(null)
            showToast('Signed out')
          }}
          onSwitchToFrontend={() => setView('frontend')}
        />
      ) : (
        <FrontendApp
          platformData={platformData}
          frontendUser={frontendUser}
          onSubmitVerification={async (payload) => {
            const result = await api.submitFrontendVerification(frontendToken, payload)
            await refreshFrontendData(frontendToken)
            if (token) refreshAdminData(token).catch(() => {})
            return result
          }}
          onChangeFrontendPassword={(body) => api.changeFrontendPassword(frontendToken, body)}
          onLogout={() => {
            setFrontendToken('')
            setFrontendUser(null)
            showToast('Signed out')
          }}
          onClaimTask={async (taskId) => {
            const result = await api.claimTask(frontendToken, taskId)
            setPlatformData(derivePlatformData(result.platformData))
            if (token) refreshAdminData(token).catch(() => {})
            return result
          }}
          onSubmitTaskProof={async (claimId, proofText) => {
            const result = await api.submitTaskProof(frontendToken, claimId, proofText)
            setPlatformData(derivePlatformData(result.platformData))
            if (token) refreshAdminData(token).catch(() => {})
            return result
          }}
          onCreateWithdrawRequest={async (payload) => {
            const result = await api.createWithdrawRequest(frontendToken, payload)
            setPlatformData(derivePlatformData(result.platformData))
            if (token) refreshAdminData(token).catch(() => {})
            return result
          }}
        />
      )}
    </>
  )
}

export default App
