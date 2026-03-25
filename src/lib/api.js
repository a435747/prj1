const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  changePassword: (token, body) => request('/auth/change-password', { method: 'POST', body, token }),
  changeAccount: (token, body) => request('/auth/change-account', { method: 'POST', body, token }),
  getPlatform: () => request('/platform'),
  savePlatform: (token, body) => request('/platform', { method: 'PUT', body, token }),
  getAdminData: (token) => request('/admin/data', { token }),
}
