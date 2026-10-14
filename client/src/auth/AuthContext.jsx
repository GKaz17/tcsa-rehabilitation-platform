import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSession, loginRequest, logoutRequest } from '../lib/api'
import { AuthContext, useAuth } from './useAuth'

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, csrfToken: null })
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')
  const generation = useRef(0)
  const mutating = useRef(false)

  const refresh = useCallback(async (signal) => {
    if (mutating.current) return
    const request = ++generation.current
    try {
      const next = await getSession({ signal })
      if (request !== generation.current || signal?.aborted) return
      setSession(next)
      setStatus('ready')
      setError('')
    } catch (failure) {
      if (failure.name === 'AbortError' || request !== generation.current) return
      setStatus('error')
      setError(failure.message)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const request = ++generation.current
    getSession({ signal: controller.signal }).then((next) => {
      if (request !== generation.current || controller.signal.aborted) return
      setSession(next)
      setStatus('ready')
      setError('')
    }).catch((failure) => {
      if (failure.name === 'AbortError' || request !== generation.current) return
      setStatus('error')
      setError(failure.message)
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!session.user) return
    // Session checks do not extend inactivity. Future protected API actions do.
    function recheck() { if (document.visibilityState === 'visible') refresh() }
    const interval = window.setInterval(recheck, 60000)
    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', recheck)
      document.removeEventListener('visibilitychange', recheck)
    }
  }, [session.user, refresh])

  async function signIn(email, password) {
    mutating.current = true
    generation.current += 1
    try {
      const next = await loginRequest(email, password, session.csrfToken)
      setSession(next)
      setStatus('ready')
      setError('')
    } catch (failure) {
      if (failure.status === 403) {
        // A stale tab gets a fresh form token; do not retry its password.
        mutating.current = false
        await refresh()
      }
      throw failure
    } finally { mutating.current = false }
  }

  async function signOut() {
    mutating.current = true
    generation.current += 1
    try {
      setSession(await logoutRequest(session.csrfToken))
      setStatus('ready')
      setError('')
    } catch (failure) {
      mutating.current = false
      await refresh()
      throw failure
    } finally { mutating.current = false }
  }

  return <AuthContext.Provider value={{ ...session, status, error, refresh, signIn, signOut }}>
    {children}
  </AuthContext.Provider>
}

export function RequireStaff() {
  const auth = useAuth()
  const location = useLocation()
  if (auth.status === 'checking') return <main className="public-main auth-state" role="status">Checking your sign-in…</main>
  if (auth.status === 'error') return <main className="public-main auth-state"><section className="card">
    <h1 tabIndex="-1">Unable to check your sign-in</h1><p role="alert">{auth.error}</p>
    <button className="button primary" type="button" onClick={() => auth.refresh()}>Try again</button>
  </section></main>
  if (!auth.user) return <Navigate to="/staff/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  return <Outlet />
}
