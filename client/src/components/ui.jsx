import { Link } from 'react-router-dom'

export function Rings() {
  return (
    <svg className="rings" viewBox="0 0 240 100" fill="none" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((ring) => (
        <ellipse
          key={ring}
          cx={44 + ring * 38}
          cy="50"
          rx="40"
          ry="46"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export function PageHeader({
  eyebrow = 'Care workspace',
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 tabIndex="-1">{title}</h1>
        <p>{description}</p>
      </div>
      {action}
      <Rings />
    </header>
  )
}

export function Status({ value }) {
  const tone =
    value === 'In treatment'
      ? 'orange'
      : value === 'Released'
        ? 'neutral'
        : 'green'
  return <span className={`status ${tone}`}>{value}</span>
}

export function AnimalTable({ animals }) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Animal records"
      tabIndex="0"
    >
      <table>
        <thead>
          <tr>
            <th scope="col">Animal</th>
            <th scope="col">Status</th>
            <th scope="col">Location</th>
            <th scope="col">Assigned carer</th>
            <th scope="col">Record</th>
          </tr>
        </thead>
        <tbody>
          {animals.map((animal) => (
            <tr key={animal.id}>
              <th scope="row">
                <Link to={`/dashboard/animals/${animal.id}`}>
                  {animal.name}
                </Link>
                <small>
                  {animal.species} · {animal.id}
                </small>
              </th>
              <td>
                <Status value={animal.status} />
              </td>
              <td>{animal.location}</td>
              <td>{animal.carer}</td>
              <td>
                <Link
                  className="text-link"
                  to={`/dashboard/animals/${animal.id}`}
                  aria-label={`View ${animal.name}'s record`}
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
