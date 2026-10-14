import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Rings } from '../components/ui'
import { useAuth } from '../auth/useAuth'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const auth = useAuth()
  const location = useLocation()
  const requested = location.state?.from
  const destination = typeof requested === 'string' && /^\/dashboard(?:\/|$)/.test(requested)
    ? requested : '/dashboard/today'
  if (auth.status === 'ready' && auth.user) return <Navigate to={destination} replace />

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setMessage('')
    setFieldErrors({})
    setSubmitting(true)
    try { await auth.signIn(form.elements.email.value.trim(), form.elements.password.value) }
    catch (error) {
      setMessage(error.message)
      setFieldErrors(Object.fromEntries((error.errors || []).map((item) => [item.field, item.message])))
    } finally {
      form.elements.password.value = ''
      setShowPassword(false)
      setSubmitting(false)
    }
  }
  const ready = auth.status === 'ready'
  return (
    <section className="staff-login" aria-labelledby="login-title">
      <div className="login-intro"><Rings /><p className="eyebrow">Tortoise Conservation South Africa</p>
        <h2>Protect Today,<br />Preserve Tomorrow.</h2><p>A private workspace for rehabilitation care and records.</p>
      </div>
      <form className="card login-card" onSubmit={submit} aria-busy={submitting || auth.status === 'checking'}>
        <h1 id="login-title" tabIndex="-1">Staff Login</h1>
        <p>Access the rehabilitation dashboard.</p>
        <label>Email address<input name="email" type="email" autoComplete="username" placeholder="Enter email address" required maxLength={254}
          disabled={submitting} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} /></label>
        {fieldErrors.email ? <p className="field-error" id="email-error">{fieldErrors.email}</p> : null}
        <label htmlFor="staff-password">Password</label>
        <div className="password-control"><input id="staff-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={1024}
          disabled={submitting} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined} />
          <button type="button" disabled={submitting} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        {fieldErrors.password ? <p className="field-error" id="password-error">{fieldErrors.password}</p> : null}
        <button className="button primary" type="submit" disabled={!ready || submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        {auth.status === 'checking' ? <p className="login-message" role="status">Checking your sign-in…</p> : null}
        {auth.status === 'error' ? <><p className="login-message" role="alert">{auth.error}</p><button className="button secondary" type="button" onClick={() => auth.refresh()}>Try again</button></> : null}
        {message ? <p className="login-message" role="alert">{message}</p> : null}
      </form>
    </section>
  )
}
