import { Link } from 'react-router-dom'
import { PageHeader, Rings } from '../components/ui'

export function Landing() {
  return (
    <>
      <section className="landing-hero">
        <p className="eyebrow">TCSA Rehabilitation Platform</p>
        <h1 tabIndex="-1">
          A little care.
          <br />
          <em>A new beginning.</em>
        </h1>
        <p>
          A connected space for animal rehabilitation, from first intake to a
          return to the wild.
        </p>
        <div className="actions">
          <Link className="button primary" to="/about">
            Explore our approach →
          </Link>
          <Link className="button outline" to="/login">
            Staff workspace
          </Link>
        </div>
        <Rings />
      </section>
      <section
        className="grid three public-cards"
        aria-label="Rehabilitation journey"
      >
        {[
          [
            '01',
            'Rescue & receive',
            'Begin with a clear intake record and an understanding of each animal’s needs.',
          ],
          [
            '02',
            'Recover & rehabilitate',
            'Keep care, observations and case history connected throughout recovery.',
          ],
          [
            '03',
            'Return & reflect',
            'Follow progress toward release and learn from each rehabilitation journey.',
          ],
        ].map(([number, title, copy]) => (
          <article className="card" key={number}>
            <p className="eyebrow">{number}</p>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </>
  )
}
export function About() {
  return (
    <>
      <PageHeader
        eyebrow="Our approach"
        title="Care, connected."
        description="A shared journey from intake to rehabilitation and release."
      />
      <section className="card prose">
        <h2>Supporting the rehabilitation journey</h2>
        <p>
          The TCSA platform brings animal records, care observations and
          reporting into one staff workspace.
        </p>
        <p>
          This initial public surface introduces the workflow. Organisation
          details and programme copy will be reconciled with the original Group
          11 handoff before publication.
        </p>
        <Link className="button primary" to="/contact">
          Contact & enquiries →
        </Link>
      </section>
    </>
  )
}
export function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact & enquiries"
        description="Find the right next step."
      />
      <section className="card prose">
        <h2>Public enquiries</h2>
        <p>
          Verified contact details and the enquiry process will be added from
          the original TCSA handoff. This prototype does not send enquiries.
        </p>
        <h2>Staff access</h2>
        <p>
          Explore the mock rehabilitation workspace through the staff entry
          point.
        </p>
        <Link className="button primary" to="/login">
          Open staff entry →
        </Link>
      </section>
    </>
  )
}
export function Login() {
  return (
    <>
      <PageHeader
        eyebrow="Staff entry"
        title="Welcome to your care workspace."
        description="Keep every animal’s journey in view."
      />
      <section className="card prose">
        <span className="status orange">Phase 1 demo</span>
        <h2>Explore the dashboard</h2>
        <p>
          This preview uses fictional animal records. Staff authentication will
          be implemented in a later phase; no account or password is needed
          here.
        </p>
        <Link className="button primary" to="/dashboard">
          Enter demo workspace →
        </Link>
      </section>
    </>
  )
}
export function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="This page is not part of the current workspace."
      />
      <Link className="button primary" to="/">
        Return to the public website
      </Link>
    </>
  )
}
