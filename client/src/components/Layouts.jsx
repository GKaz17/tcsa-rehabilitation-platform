import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

function RouteFocus() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('h1')?.focus()
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function PublicLayout() {
  return (
    <>
      <RouteFocus />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="public-nav">
        <Link className="brand" to="/">
          TCSA<span>Rehabilitation & care</span>
        </Link>
        <nav aria-label="Public navigation">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <Link className="button primary" to="/login">
            Staff workspace →
          </Link>
        </nav>
      </header>
      <main id="main" className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        TCSA · Rehabilitation platform{' '}
        <span>Phase 1 prototype · fictional data</span>
      </footer>
    </>
  )
}

export function DashboardLayout({ animals, addAnimal }) {
  const [menuOpen, setMenuOpen] = useState(false)
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
            ['/dashboard', 'Today', '01'],
            ['/dashboard/animals', 'Animals', '02'],
            ['/dashboard/reports', 'Reports', '03'],
          ].map(([url, label, number]) => (
            <NavLink
              key={url}
              to={url}
              end={url === '/dashboard'}
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
          <small>
            Mock workspace
            <br />
            Changes reset on refresh.
          </small>
        </div>
      </aside>
      <div className="workspace">
        <div className="workspace-bar">
          <span>
            Staff workspace / <strong>Demo</strong>
          </span>
          <span className="demo-badge">Mock data</span>
        </div>
        <main id="main">
          <Outlet context={{ animals, addAnimal }} />
        </main>
        <footer className="workspace-footer">
          Every record is a step toward recovery.<span>TCSA · Group 11</span>
        </footer>
      </div>
    </div>
  )
}
