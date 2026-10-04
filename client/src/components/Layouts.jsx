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
          {isLanding ? <><a href="#about-us">About</a><a href="#support-us">Support us</a><a href="#contact-dirk">Contact</a></> : <><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink></>}
        </nav>
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
        </div>
      </aside>
      <div className="workspace">
        <div className="workspace-bar">
          <span>Staff workspace</span>
          <span className="workspace-label">Rehabilitation & care</span>
        </div>
        <main id="main">
          <Outlet context={{ animals, addAnimal }} />
        </main>
        <footer className="workspace-footer">
          Every record is a step toward recovery.<span>TCSA</span>
        </footer>
      </div>
    </div>
  )
}
