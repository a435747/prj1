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
  adminLogin: (body) => request('/auth/login', { method: 'POST', body }),
  getAdminUser: (token) => request('/auth/me', { token }),
  changePassword: (token, body) => request('/auth/change-password', { method: 'POST', body, token }),
  changeAccount: (token, body) => request('/auth/change-account', { method: 'POST', body, token }),

  registerFrontendUser: (body) => request('/frontend-auth/register', { method: 'POST', body }),
  loginFrontendUser: (body) => request('/frontend-auth/login', { method: 'POST', body }),
  getFrontendUser: (token) => request('/frontend-auth/me', { token }),
  changeFrontendPassword: (token, body) => request('/frontend-auth/change-password', { method: 'POST', body, token }),
  submitFrontendVerification: (token, body) => request('/frontend-auth/verification', { method: 'POST', body, token }),

  getPlatform: (token) => request('/platform', { token }),
  claimTask: (token, taskId) => request('/platform/claim-task', { method: 'POST', body: { taskId }, token }),
  submitTaskProof: (token, claimId, proofText) =>
    request(`/platform/task-claims/${claimId}/submit`, { method: 'POST', body: { proofText }, token }),
  createWithdrawRequest: (token, body) => request('/platform/withdraw-requests', { method: 'POST', body, token }),

  createRechargeRequest: (token, body) => request('/platform/recharge-requests', { method: 'POST', body, token }),
  reviewRechargeRequest: (token, requestId, action, reason = '') =>
    request(`/admin/recharge-requests/${requestId}/review`, { method: 'POST', body: { action, reason }, token }),

  savePlatform: (token, body) => request('/platform', { method: 'PUT', body, token }),
  getAdminData: (token) => request('/admin/data', { token }),
  reviewTaskClaim: (token, claimId, action, reason = '') =>
    request(`/admin/task-claims/${claimId}/review`, { method: 'POST', body: { action, reason }, token }),
  reviewWithdrawRequest: (token, requestId, action, reason = '') =>
    request(`/admin/withdraw-requests/${requestId}/review`, { method: 'POST', body: { action, reason }, token }),
  reviewVerification: (token, verificationId, action, reason = '') =>
    request(`/admin/verifications/${verificationId}/review`, { method: 'POST', body: { action, reason }, token }),

  freezeUser: (token, userId, action) =>
    request(`/admin/users/${userId}/freeze`, { method: 'POST', body: { action }, token }),
  editUser: (token, userId, body) =>
    request(`/admin/users/${userId}/edit`, { method: 'POST', body, token }),
  saveVipLevels: (token, vipLevels) =>
    request('/admin/vip-levels', { method: 'POST', body: { vipLevels }, token }),
  saveRules: (token, rules) =>
    request('/admin/rules', { method: 'POST', body: { rules }, token }),
  reviewOrder: (token, orderNo, action) =>
    request(`/admin/orders/${orderNo}/review`, { method: 'POST', body: { action }, token }),
}
