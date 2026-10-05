import { useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { PageHeader, Status } from '../components/ui'
import { statuses } from '../data/animals'
import { careDate, priorityTasks } from '../data/tasks'
export function AnimalProfile() {
  const { animals, tasks } = useOutletContext()
  const { id } = useParams()
  const { state } = useLocation()
  const animal = animals.find((a) => a.id === id)
  const animalTasks = tasks.filter((task) => task.animalId === id)
  const nextTask = priorityTasks(animalTasks.filter((task) => !task.completed))[0]
  const nextCare = animalTasks.length
    ? nextTask ? `${nextTask.time} · ${nextTask.title}` : null
    : animal?.nextCare
  if (!animal)
    return (
      <>
        <PageHeader
          title="Animal record not found"
          description="Return to the animal list to find another record."
        />
        <Link className="button accent" to="/dashboard/animals">
          Back to animals
        </Link>
      </>
    )
  return (
    <>
      <Link className="light-link" to="/dashboard/animals">
        ← All animals
      </Link>
      <PageHeader
        eyebrow={`${animal.id} · Animal record`}
        title={animal.name}
        description={animal.species}
        action={<Status value={animal.status} />}
      />
      {state?.created ? (
        <p className="success-message" role="status">
          Animal record added.
        </p>
      ) : null}
      <div className="grid overview-columns">
        <section className="card">
          <h2>Care overview</h2>
          <dl className="details">
            <div>
              <dt>Admitted</dt>
              <dd>{animal.admitted}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{animal.location}</dd>
            </div>
            <div>
              <dt>Assigned carer</dt>
              <dd>{animal.carer}</dd>
            </div>
            <div>
              <dt>Next care</dt>
              <dd>{nextCare || 'No care scheduled'}</dd>
            </div>
          </dl>
          <h3>Reason for admission</h3>
          <p>{animal.reason}</p>
        </section>
        <section className="card">
          <p className="eyebrow">From intake onward</p>
          <h2>Case history</h2>
          <ol className="timeline">
            {animal.history.map((entry, index) => (
              <li key={`${entry.date}-${index}`}>
                <time dateTime={entry.date}>{entry.date}</time>
                <p>{entry.note}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}

export function NewAnimal() {
  const { addAnimal } = useOutletContext()
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = {}
    for (const field of ['name', 'species', 'location', 'carer', 'reason']) {
      values[field] = values[field].trim()
      if (!values[field])
        nextErrors[field] = 'Enter a value containing more than spaces.'
    }
    if (values.admitted > careDate)
      nextErrors.admitted = 'Choose a date on or before the current care date.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    // Records live in memory until the PHP/MySQL slice; refresh resets them.
    const id = `TCSA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    addAnimal({
      ...values,
      id,
      nextCare: null,
      history: [{ date: values.admitted, note: values.reason }],
    })
    navigate(`/dashboard/animals/${id}`, { state: { created: true } })
  }
  return (
    <>
      <PageHeader
        title="A new journey begins."
        description="Record an animal’s details and initial care needs."
      />
      <form className="card intake-form" onSubmit={submit}>
        <h2>Animal details</h2>
        <div className="grid two">
          {[
            ['name', 'Animal name', 'e.g. Willow'],
            ['species', 'Species', 'e.g. Cape tortoise'],
            ['location', 'Care location', 'e.g. Care room A'],
            ['carer', 'Assigned carer', 'e.g. Thandi M.'],
          ].map(([field, label, placeholder]) => (
            <label key={field}>
              {label}
              <input
                name={field}
                placeholder={placeholder}
                required
                maxLength={80}
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
              />
              {errors[field] ? (
                <small className="field-error" id={`${field}-error`}>
                  {errors[field]}
                </small>
              ) : null}
            </label>
          ))}
          <label>
            Admission date
            <input
              type="date"
              name="admitted"
              defaultValue={careDate}
              max={careDate}
              required
              aria-invalid={Boolean(errors.admitted)}
              aria-describedby={errors.admitted ? 'admitted-error' : undefined}
            />
            {errors.admitted ? (
              <small className="field-error" id="admitted-error">
                {errors.admitted}
              </small>
            ) : null}
          </label>
          <label>
            Care status
            <select name="status" defaultValue="In treatment">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Reason for admission
          <textarea
            name="reason"
            rows="4"
            required
            maxLength={1000}
            placeholder="Add the initial observation and reason for care."
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={errors.reason ? 'reason-error' : undefined}
          />
          {errors.reason ? (
            <small className="field-error" id="reason-error">
              {errors.reason}
            </small>
          ) : null}
        </label>
        {Object.keys(errors).length ? (
          <p className="field-error" role="alert">
            Please correct the highlighted fields.
          </p>
        ) : null}
        <div className="form-actions">
          <Link className="button secondary" to="/dashboard/animals">
            Cancel
          </Link>
          <button className="button primary" type="submit">
            Add animal →
          </button>
        </div>
      </form>
    </>
  )
}

export function Reports() {
  // Counts derive from local fixtures. Live data, date filters and exports follow
  // the PHP/MySQL animal-management slice.
  const { animals } = useOutletContext()
  return (
    <>
      <PageHeader
        title="Care, in perspective."
        description="Track progress through treatment, rehabilitation and release."
      />
      <section className="card">
        <div className="section-heading">
          <h2>Rehabilitation overview</h2>
          <span>{animals.length} total records</span>
        </div>
        <div className="report-bars">
          {statuses.map((status) => {
            const count = animals.filter((a) => a.status === status).length
            return (
              <div key={status}>
                <div className="section-heading">
                  <Status value={status} />
                  <strong>{count}</strong>
                </div>
                <meter
                  min="0"
                  max={animals.length || 1}
                  value={count}
                  aria-label={`${status}: ${count} of ${animals.length} animals`}
                />
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
