// Same-origin JSON boundary. Only PHP will communicate with MySQL.
export async function apiRequest(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })
  const result = await response.json()
  if (!response.ok || result.success !== true) {
    throw new Error(
      result.message || 'The API request failed. Please try again.',
    )
  }
  return result.data
}

export const getHealth = (options) => apiRequest('health.php', options)
