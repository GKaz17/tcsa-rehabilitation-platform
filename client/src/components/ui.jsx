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
