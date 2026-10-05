import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui'
export function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="Return to TCSA to find the page you need."
      />
      <Link className="button accent" to="/">
        Return to the public website
      </Link>
    </>
  )
}
