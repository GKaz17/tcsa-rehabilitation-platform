import { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import { AnimalTable, PageHeader, Status } from '../components/ui'
import { statuses } from '../data/animals'

const demoDate = '2026-10-04'

export function Overview() {
  const { animals } = useOutletContext()
  const active = animals.filter((animal) => animal.status !== 'Released')
  return (
    <>
      <PageHeader
        eyebrow="Sunday, 04 October 2026 · Demo day"
        title="Today, in care."
        description="A clear view of the animals and the moments that matter."
        action={
          <Link className="button accent" to="/dashboard/animals/new">
            + Add animal
          </Link>
        }
      />
      <div className="grid three stats">
        {[
          [
            'Animals in care',
            active.length,
            'Across treatment and rehabilitation',
          ],
          [
            'In treatment',
            animals.filter((a) => a.status === 'In treatment').length,
            'Receiving dedicated support',
          ],
          [
            'Ready for release',
            animals.filter((a) => a.status === 'Ready for release').length,
            'A new beginning ahead',
          ],
        ].map(([label, value, caption]) => (
          <article className="card stat" key={label}>
            <p>{label}</p>
            <strong>{value.toString().padStart(2, '0')}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </div>
      <div className="grid overview-columns">
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A little attention goes a long way</p>
              <h2>Care schedule</h2>
            </div>
            <span className="status green">Demo day</span>
          </div>
          <ul className="care-list">
            {active
              .filter((a) => a.nextCare)
              .map((a) => (
                <li key={a.id}>
                  <span className="animal-initial" aria-hidden="true">
                    {a.name[0]}
                  </span>
                  <div>
                    <Link to={`/dashboard/animals/${a.id}`}>{a.name}</Link>
                    <small>{a.nextCare}</small>
                  </div>
                  <Status value={a.status} />
                </li>
              ))}
          </ul>
        </section>
        <section className="card orange-shadow">
          <p className="eyebrow">Recovery in focus</p>
          <h2>
            One step closer
            <br />
            to the wild.
          </h2>
          <p>
            Follow each animal’s progress, keep observations together and make
            the next care decision with context.
          </p>
          <Link className="button secondary" to="/dashboard/animals">
            View all animals →
          </Link>
          <div className="note">
            All records and care times in this preview are fictional.
          </div>
        </section>
      </div>
      <section className="card">
        <div className="section-heading">
          <h2>Animals in care</h2>
          <Link to="/dashboard/animals">All records →</Link>
        </div>
        <AnimalTable animals={active.slice(0, 4)} />
      </section>
    </>
  )
}

export function AnimalList() {
  const { animals } = useOutletContext()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const query = search.trim().toLowerCase()
  const filtered = animals.filter(
    (a) =>
      `${a.name} ${a.species} ${a.id}`.toLowerCase().includes(query) &&
      (status === 'All statuses' || a.status === status),
  )
  function reset() {
    setSearch('')
    setStatus('All statuses')
  }
  return (
    <>
      <PageHeader
        title="Every animal. One workspace."
        description="Find a record, follow progress and keep care connected."
        action={
          <Link className="button accent" to="/dashboard/animals/new">
            + Add animal
          </Link>
        }
      />
      <section className="card">
        <div className="filters">
          <label>
            Search animals
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, species or record ID"
              type="search"
            />
          </label>
          <label>
            Care status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All statuses</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button className="button secondary" onClick={reset}>
            Reset filters
          </button>
        </div>
        <p className="result-count" role="status">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
        </p>
        {filtered.length ? (
          <AnimalTable animals={filtered} />
        ) : (
          <div className="empty">
            <h2>No animals match these filters.</h2>
            <p>Try a different name or care status.</p>
            <button className="button secondary" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export function AnimalProfile() {
  const { animals } = useOutletContext()
  const { id } = useParams()
  const { state } = useLocation()
  const animal = animals.find((a) => a.id === id)
  if (!animal)
    return (
      <>
        <PageHeader
          title="Animal record not found"
          description="This record may be unavailable, or a demo record may have reset on refresh."
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
          Mock animal record added. This record will reset on refresh.
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
              <dd>{animal.nextCare || 'No care scheduled'}</dd>
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
    if (values.admitted > demoDate)
      nextErrors.admitted = 'Admission cannot be after the demo day.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const id = `TCSA-DEMO-${crypto.randomUUID().slice(0, 8)}`
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
        description="Create a mock intake record. Changes stay in this session and reset on refresh."
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
              defaultValue={demoDate}
              max={demoDate}
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
            Add mock animal →
          </button>
        </div>
      </form>
    </>
  )
}

export function Reports() {
  const { animals } = useOutletContext()
  return (
    <>
      <PageHeader
        title="Care, in perspective."
        description="A snapshot of the current fictional records, including any animals added in this session."
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
        <p className="note">
          Live reporting, date-range filters and exports will follow after the
          PHP/MySQL animal-management slice.
        </p>
      </section>
    </>
  )
}
