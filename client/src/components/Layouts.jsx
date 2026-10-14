import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import NavTurtle from './NavTurtle'
import { useAuth } from '../auth/useAuth'

function RouteFocus() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) {
      const heading = target.querySelector('h2') || target
      heading.focus({ preventScroll: true })
      target.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    } else {
      document.querySelector('h1')?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

export function PublicLayout() {
  const isLanding = useLocation().pathname === '/'
  return (
    <div className={isLanding ? 'public-site landing-site' : 'public-site'}>
      <RouteFocus />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`public-nav${isLanding ? ' landing-container' : ''}`}>
        <Link className="brand" to="/">
          TCSA<span>Rehabilitation & care</span>
        </Link>
        <nav aria-label="Public navigation">
          <Link to="/#about-us">About</Link>
          <Link to="/#support-us">Support us</Link>
          <Link to="/#contact-dirk">Contact</Link>
        </nav>
        {isLanding ? <NavTurtle /> : null}
      </header>
      <main id="main" className={`public-main${isLanding ? ' landing-container' : ''}`}>
        <Outlet />
      </main>
      <footer className={`public-footer${isLanding ? ' landing-container' : ''}`}>
        TCSA · Rehabilitation & care
        <span>Care, connected.</span>
      </footer>
    </div>
  )
}

export function DashboardLayout({ animals, addAnimal, tasks, completeTask }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const { user, signOut } = useAuth()
  async function logout() {
    setSigningOut(true)
    setSignOutError('')
    try { await signOut() }
    catch (error) { setSignOutError(error.message) }
    finally { setSigningOut(false) }
  }
  return (
    <div className="dashboard">
      <RouteFocus />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          TCSA<span>Rehabilitation & care</span>
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="workspace-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu {menuOpen ? '−' : '+'}
        </button>
        <nav
          id="workspace-nav"
          className={menuOpen ? 'open' : ''}
          aria-label="Workspace navigation"
        >
          <p className="eyebrow">Workspace</p>
          {[
            ['/dashboard/today', 'Today', '01'],
            ['/dashboard/animals', 'Animals', '02'],
            ['/dashboard/reports', 'Reports', '03'],
          ].map(([url, label, number]) => (
            <NavLink
              key={url}
              to={url}
              end={url === '/dashboard/today'}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{number}</span>
              {label}
            </NavLink>
          ))}
          <Link className="back-public" to="/">
            ← Public website
          </Link>
        </nav>
        <div className="sidebar-note">
          <span className="presence" /> Care starts with connection.
        </div>
      </aside>
      <div className="workspace">
        <div className="workspace-bar">
          <span>Staff workspace</span>
          <div className="staff-session-controls">
            <span className="staff-user" title={user.email}>{user.name}</span>
            <button className="button secondary" type="button" disabled={signingOut} onClick={logout}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
          </div>
        </div>
        {signOutError ? <p className="sign-out-error" role="alert">{signOutError}</p> : null}
        <main id="main">
          <Outlet context={{ animals, addAnimal, tasks, completeTask }} />
        </main>
        <footer className="workspace-footer">
          Every record is a step toward recovery.<span>TCSA</span>
        </footer>
      </div>
    </div>
  )
}
