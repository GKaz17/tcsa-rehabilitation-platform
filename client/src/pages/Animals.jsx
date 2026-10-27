import { useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { PageHeader, Status } from '../components/ui'
import { statuses } from '../data/animals'

export default function Animals() {
  const { animals, tasks, clock } = useOutletContext()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All animals')
  const [species, setSpecies] = useState('All species')
  const searchControl = useRef(null)
  const query = search.trim().toLowerCase()
  const speciesOptions = [...new Set(animals.map((animal) => animal.species))].sort()
  const filtered = animals.filter((animal) =>
    `${animal.name} ${animal.species} ${animal.id}`.toLowerCase().includes(query) &&
    (status === 'All animals' || animal.status === status) &&
    (species === 'All species' || animal.species === species))
  // A count of animals with scheduled medication care, not prescriptions.
  const medicationAnimals = new Set(tasks.filter((task) => task.type === 'Medication' && !task.completed && task.date <= clock.date).map((task) => task.animalId))
  const summary = [
    ['In care', animals.filter((animal) => animal.status !== 'Released').length],
    ['Active medications', animals.filter((animal) => animal.status !== 'Released' && medicationAnimals.has(animal.id)).length],
    ['Release review', animals.filter((animal) => animal.status === 'Ready for release').length],
    ['Species', speciesOptions.length],
  ]
  function reset() {
    setSearch('')
    setStatus('All animals')
    setSpecies('All species')
    searchControl.current?.focus()
  }

  return (
    <>
      <PageHeader title="Animal Management" description="Search, review and follow every animal in rehabilitation."
        action={<Link className="button accent" to="/dashboard/animals/new">+ Add animal</Link>} />
      <div className="animal-controls">
        <label className="animal-search">Search animals<input ref={searchControl} type="search" value={search} placeholder="Name, species or record ID" onChange={(event) => setSearch(event.target.value)} /></label>
        <label>Species<select value={species} onChange={(event) => setSpecies(event.target.value)}><option>All species</option>{speciesOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="filter-chips" role="group" aria-label="Filter animals by care status">
        {['All animals', ...statuses].map((value) => <button type="button" key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>
          {value}<span>{value === 'All animals' ? animals.length : animals.filter((animal) => animal.status === value).length}</span>
        </button>)}
      </div>
      <div className="summary-grid animal-summary" aria-label="Animal summary">
        {summary.map(([label, count]) => <article className="card summary-stat" key={label}><strong>{count}</strong><p>{label}</p></article>)}
      </div>
      <p className="animal-results" role="status">{filtered.length} {filtered.length === 1 ? 'animal' : 'animals'} found</p>
      {filtered.length ? <div className="animal-card-grid">
        {filtered.map((animal) => {
          const careDays = Math.max(1, Math.floor((Date.parse(clock.date) - Date.parse(animal.admitted)) / 86400000) + 1)
          return <article className="card animal-card" key={animal.id}>
            {/* Decorative placeholder matches the design; source animal photos
                have not been supplied. Do not pass gallery photos off as cases. */}
            <div className="animal-portrait" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><ellipse cx="40" cy="40" rx="27" ry="20" /><path d="m40 20 12 10-4 20-17 4-12-16 8-13Z" /></svg></div>
            <div className="animal-card-content">
              <h2><Link to={`/dashboard/animals/${animal.id}`}>{animal.name}</Link></h2>
              <p>{animal.species} · {animal.id}</p>
              <Status value={animal.status} />
              <small>{animal.status === 'Released' ? 'Care completed' : `Day ${careDays} in care`} · {animal.location}</small>
              <small>Assigned carer: {animal.carer}</small>
            </div>
            <Link className="animal-card-open" to={`/dashboard/animals/${animal.id}`} aria-label={`View ${animal.name}'s record`}>→</Link>
          </article>
        })}
      </div> : <section className="card empty"><h2>{animals.length ? 'No animals match these filters.' : 'No animal records yet.'}</h2><p>{animals.length ? 'Try a different name, species or care status.' : 'Add an animal to begin its care record.'}</p>{animals.length ? <button className="button secondary" onClick={reset}>Clear filters</button> : <Link className="button primary" to="/dashboard/animals/new">Add animal</Link>}</section>}
    </>
  )
}
