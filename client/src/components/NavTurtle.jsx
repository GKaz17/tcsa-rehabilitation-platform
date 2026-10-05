import { useState } from 'react'

// Original decorative vector artwork, not a replacement for the TCSA logo.
// CSS moves the wrapper; there are no animation-frame React state updates.
export default function NavTurtle() {
  const [paused, setPaused] = useState(false)
  return (
    <div className={`nav-turtle-scene${paused ? ' turtle-paused' : ''}`}>
      <div className="nav-turtle-track" aria-hidden="true">
        <div className="nav-turtle-traveller">
          <div className="nav-turtle-direction">
            <div className="nav-turtle-body">
              <svg viewBox="0 0 64 38" fill="none" focusable="false">
                <g className="turtle-leg turtle-leg-far">
                  <path d="m19 25 3 7h6m9-7-5 7h6" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <path d="m11 23-8 2 8 2" fill="var(--green)" />
                <path d="M39 21c5 0 7-4 10-4" stroke="var(--green)" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="52" cy="17" rx="8" ry="6" fill="var(--green)" />
                <circle cx="55" cy="15" r="1.3" fill="var(--background)" />
                <path d="m55 20 3-.5" stroke="var(--background)" strokeWidth="0.8" strokeLinecap="round" />
                <g className="turtle-leg turtle-leg-rear">
                  <path d="m19 25-4 7H9" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g className="turtle-leg turtle-leg-front">
                  <path d="m36 25 4 7h6" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <path d="M10 25C9 13 17 5 27 5c11 0 19 9 18 20-11 4-24 4-35 0Z" fill="var(--green)" stroke="var(--background)" strokeWidth="1.3" />
                <path d="m24 7-6 9 5 9h12l5-9-8-9Zm-6 9-7 1m12 8-4 3m16-3 5 2m0-11 4 2m-20-11 3-2" stroke="var(--success)" strokeWidth="1.1" strokeLinejoin="round" />
                <path d="M15 15c3-5 6-7 11-7" stroke="var(--pale)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <button className="nav-motion-toggle" type="button" aria-pressed={paused}
        aria-label={paused ? 'Resume turtle animation' : 'Pause turtle animation'}
        title={paused ? 'Resume turtle animation' : 'Pause turtle animation'}
        onClick={() => setPaused((current) => !current)}>
        <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          {paused ? <path d="m6 4 10 6-10 6Z" /> : <><rect x="5" y="4" width="3" height="12" rx="1" /><rect x="12" y="4" width="3" height="12" rx="1" /></>}
        </svg>
      </button>
    </div>
  )
}
