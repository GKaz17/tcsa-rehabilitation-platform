import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Password() {
  const auth = useAuth()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  if (auth.status === 'ready' && !auth.user) return <Navigate to="/staff/login" replace />
  if (auth.status === 'ready' && auth.user && !auth.user.mustChangePassword) return <Navigate to="/dashboard/today" replace />
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (form.elements.password.value !== form.elements.confirmation.value) { setMessage('The new passwords do not match.'); return }
    setBusy(true)
    setMessage('')
    try { await auth.changePassword(form.elements.currentPassword.value, form.elements.password.value) }
    catch (error) { setMessage(error.message) }
    finally { form.reset(); setBusy(false) }
  }
  return <section className="card intake-form"><h1 tabIndex="-1">Choose your password</h1>
    <p>Replace your temporary password before opening care records. Use at least 12 characters.</p>
    <form onSubmit={submit} aria-busy={busy}>
      <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required maxLength={1024} disabled={busy} /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} disabled={busy} /></label>
      <label>Confirm new password<input name="confirmation" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} disabled={busy} /></label>
      <div className="form-actions"><button className="button primary" disabled={busy || auth.status !== 'ready' || !auth.user}>{busy ? 'Saving…' : 'Save password'}</button>
        {auth.user ? <button className="button secondary" type="button" disabled={busy} onClick={() => auth.signOut().catch((error) => setMessage(error.message))}>Sign out</button> : null}</div>
      {message || auth.error ? <p role="alert" className="field-error">{message || auth.error}</p> : null}
      {auth.status === 'checking' ? <p role="status">Checking your sign-in…</p> : null}
      {auth.status === 'error' ? <button className="button secondary" type="button" onClick={() => auth.refresh()}>Try again</button> : null}
    </form></section>
}
