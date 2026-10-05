import { useState } from 'react'
import { Rings } from '../components/ui'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [unavailable, setUnavailable] = useState(false)

  function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const username = form.elements.username.value.trim()
    setError(username ? '' : 'Enter your username.')
    setUnavailable(Boolean(username))
    // Phase 1 has no authentication endpoint or session. Never send, store or
    // accept credentials here, and never redirect as if sign-in succeeded.
    form.elements.password.value = ''
    if (!username) form.elements.username.focus()
  }

  return (
    <section className="staff-login" aria-labelledby="login-title">
      <div className="login-intro"><Rings /><p className="eyebrow">Tortoise Conservation South Africa</p>
        <h2>Protect Today,<br />Preserve Tomorrow.</h2><p>A private workspace for rehabilitation care and records.</p>
      </div>
      <form className="card login-card" onSubmit={submit}>
        <h1 id="login-title" tabIndex="-1">Staff Login</h1>
        <p>Access the rehabilitation dashboard.</p>
        <label>Username<input name="username" autoComplete="username" placeholder="Enter username" required maxLength={80} aria-invalid={Boolean(error)} aria-describedby={error ? 'username-error' : undefined} /></label>
        {error ? <p className="field-error" id="username-error" role="alert">{error}</p> : null}
        <label htmlFor="staff-password">Password</label>
        <div className="password-control"><input id="staff-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        <button className="button primary" type="submit">Sign in</button>
        {unavailable ? <p className="login-message" role="alert">Sign-in is currently unavailable. Please contact your administrator.</p> : null}
      </form>
    </section>
  )
}
