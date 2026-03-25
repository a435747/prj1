import { useCallback, useEffect, useState } from 'react'
import { AdminDashboard } from './admin/AdminDashboard'
import { LoginPage } from './admin/LoginPage'
import { FrontendApp } from './frontend/FrontendApp'
import { api } from './lib/api'
import { Toast } from './components/Toast'
import { initialPlatformData } from './shared/platformData'

function getInitialView() {
  const hash = window.location.hash.replace('#', '')
  return hash === 'admin' ? 'admin' : 'frontend'
}

function App() {
  const [view, setView] = useState(getInitialView)
  const [platformData, setPlatformData] = useState(initialPlatformData)
  const [adminData, setAdminData] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((title, message = '', type = 'success') => {
    setToast({ title, message, type })
  }, [])

  useEffect(() => {
    window.location.hash = view === 'admin' ? 'admin' : 'app'
  }, [view])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const [platform] = await Promise.all([api.getPlatform()])
        if (!cancelled) {
          setPlatformData(platform)
          setError('')
        }
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
  }, [])

  useEffect(() => {
    if (!token) {
      setAdminData(null)
      setAdminUser(null)
      localStorage.removeItem('admin_token')
      return
    }

    localStorage.setItem('admin_token', token)

    let cancelled = false
    api
      .getAdminData(token)
      .then((data) => {
        if (!cancelled) setAdminData(data)
      })
      .catch(() => {
        if (!cancelled) {
          setToken('')
          setAdminData(null)
          setAdminUser(null)
          showToast('登录已失效', '请重新登录后台', 'error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, showToast])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-slate-500">加载中...</div>
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
            const result = await api.login(form)
            setToken(result.token)
            setAdminUser(result.user)
            showToast('登录成功', `欢迎回来，${result.user.username}`)
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
            setPlatformData(saved)
            showToast('保存成功', '前台内容已同步到服务端')
          }}
          onChangePassword={async (body) => {
            const result = await api.changePassword(token, body)
            showToast('密码已更新', '下次登录请使用新密码')
            return result
          }}
          onChangeAccount={async (body) => {
            const result = await api.changeAccount(token, body)
            setAdminUser(result.user)
            showToast('账户已更新', `当前管理员：${result.user.username}`)
            return result
          }}
          onLogout={() => {
            setToken('')
            setAdminUser(null)
            showToast('已退出登录')
          }}
          onSwitchToFrontend={() => setView('frontend')}
        />
      ) : (
        <FrontendApp platformData={platformData} onSwitchToAdmin={() => setView('admin')} />
      )}
    </>
  )
}

export default App
