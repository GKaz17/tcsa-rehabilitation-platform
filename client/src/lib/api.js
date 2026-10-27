// Same-origin JSON boundary. Only PHP will communicate with MySQL.
export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest(path, options = {}) {
  let response
  let result
  try {
    response = await fetch(`/api/${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    })
    result = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Could not connect to TCSA. Please try again.')
  }
  if (!response.ok || result.success !== true) {
    throw new ApiError(
      result.message || 'The API request failed. Please try again.',
      response.status,
      Array.isArray(result.errors) ? result.errors : [],
    )
  }
  return result.data
}

export const getHealth = (options) => apiRequest('health.php', options)
export const getSession = (options) => apiRequest('auth/session.php', options)
export const loginRequest = (email, password, csrfToken) => apiRequest('auth/login.php', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ email, password }),
})
export const logoutRequest = (csrfToken) => apiRequest('auth/logout.php', {
  method: 'POST', headers: { 'X-CSRF-Token': csrfToken },
})

export const changePasswordRequest = (currentPassword, password, csrfToken) => apiRequest('auth/password.php', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ currentPassword, password }),
})
export const getWorkspace = (options) => apiRequest('workspace.php', options)
export const saveCare = (path, body, csrfToken) => apiRequest(path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(body),
})
