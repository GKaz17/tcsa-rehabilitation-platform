import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui'

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
          From the first observation to the next care decision, each record
          keeps an animal’s progress in view.
        </p>
        <Link className="button primary" to="/contact">
          Contact & enquiries →
        </Link>
      </section>
    </>
  )
}
export function Contact() {
  // Verified contact details and enquiry delivery still need implementation.
  // Do not invent addresses or add a form that pretends to send enquiries.
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
          Speak with the care team about animal rehabilitation, recovery and
          release.
        </p>
      </section>
    </>
  )
}
export function Login() {
  // Phase 1 provides route navigation only. Authentication is not implemented.
  return (
    <>
      <PageHeader
        eyebrow="Staff entry"
        title="Welcome to your care workspace."
        description="Keep every animal’s journey in view."
      />
      <section className="card prose">
        <h2>Your staff workspace</h2>
        <p>
          View animal records, follow care schedules and keep case histories
          together.
        </p>
        <Link className="button primary" to="/dashboard">
          Enter workspace →
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
