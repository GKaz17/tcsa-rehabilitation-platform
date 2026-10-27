import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { PageHeader, Status } from '../components/ui'
import { statuses } from '../data/animals'
import { priorityTasks } from '../data/tasks'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function MissingAnimal() {
  return <><PageHeader title="Animal record not found" description="Return to the animal list to find another record." />
    <Link className="button accent" to="/dashboard/animals">Back to animals</Link></>
}

export function AnimalProfile() {
  const { animals, tasks, clock, saving, addNote, saveTask, completeTask } = useOutletContext()
  const { id } = useParams()
  const { state } = useLocation()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const animal = animals.find((item) => item.id === id)
  const animalTasks = tasks.filter((task) => task.animalId === id)
  const nextTask = priorityTasks(animalTasks.filter((task) => !task.completed), 'All tasks', clock)[0]
  if (!animal) return <MissingAnimal />
  async function submit(event, kind) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setError(''); setMessage('')
    try {
      if (kind === 'note') await addNote({ ...values, animalId: id, admissionId: animal.admissionId, version: animal.version })
      else await saveTask({ ...values, animalId: id, admissionId: animal.admissionId })
      form.reset()
      setMessage(kind === 'note' ? 'Case note saved.' : 'Care task scheduled.')
    } catch (failure) { setError(failure.message) }
  }
  async function taskAction(task, cancel = false) {
    setError(''); setMessage('')
    try {
      if (cancel) await saveTask({ action: 'cancel', id: task.id, animalId: id, admissionId: task.admissionId, version: task.version })
      else await completeTask(task.id, !task.completed)
      setMessage(cancel ? 'Care task cancelled.' : task.completed ? 'Care task reopened.' : 'Care task completed.')
    } catch (failure) { setError(failure.message) }
  }
  return <>
    <Link className="light-link" to="/dashboard/animals">← All animals</Link>
    <PageHeader eyebrow={`${animal.id} · Animal record`} title={animal.name} description={animal.species}
      action={<div className="form-actions"><Status value={animal.status} /><Link className="button secondary" to={`/dashboard/animals/${id}/edit`}>Edit record</Link>
        {animal.status === 'Released' ? <Link className="button primary" to={`/dashboard/animals/${id}/readmit`}>Readmit</Link> : null}</div>} />
    {state?.created || message ? <p className="success-message" role="status">{message || 'Animal record saved.'}</p> : null}
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    <div className="grid overview-columns">
      <section className="card"><h2>Care overview</h2><dl className="details">
        {[['Admitted', animal.admitted], ['Location', animal.location], ['Assigned carer', animal.carer],
          ['Next care', nextTask ? `${nextTask.date} · ${nextTask.time} · ${nextTask.title}` : 'No care scheduled'],
          ...(animal.releasedOn ? [['Released', animal.releasedOn]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl><h3>Reason for admission</h3><p>{animal.reason}</p></section>
      <section className="card"><p className="eyebrow">From intake onward</p><h2>Case history</h2>
        <ol className="timeline">{animal.history.map((entry) => <li key={entry.id}><time dateTime={entry.date}>{entry.date}</time><p>{entry.note}</p>
          {entry.author ? <small>{entry.author}</small> : null}{entry.admissionId !== animal.admissionId ? <small> · Previous admission</small> : null}</li>)}</ol>
        <form className="intake-form" onSubmit={(event) => submit(event, 'note')}><h3>Add case note</h3>
          <label>Entry date<input name="date" type="date" defaultValue={animal.releasedOn || clock.date} min={animal.admitted} max={animal.releasedOn || clock.date} required disabled={saving} /></label>
          <label>Observation<textarea name="note" rows={3} maxLength={1000} required disabled={saving} /></label>
          <button className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Save case note'}</button>
        </form>
      </section>
      <section className="card"><h2>Care tasks</h2>
        {animalTasks.length ? <ul className="care-task-list">{priorityTasks(animalTasks, 'All tasks', clock).map((task) => <li key={task.id}>
          <strong>{task.title}</strong><p>{task.date} · {task.time} · {task.type}</p>
          <div className="form-actions"><button className={`button ${task.completed ? 'secondary' : 'primary'}`} disabled={saving} onClick={() => taskAction(task)}>{task.completed ? 'Undo completion' : 'Mark complete'}</button>
            {!task.completed ? <button className="button secondary" disabled={saving} onClick={() => taskAction(task, true)}>Cancel task</button> : null}</div>
        </li>)}</ul> : <p>No care tasks scheduled.</p>}
      </section>
      {animal.status !== 'Released' ? <section className="card"><form className="intake-form" onSubmit={(event) => submit(event, 'task')}><h2>Schedule care</h2>
        <label>Task title<input name="title" maxLength={160} required disabled={saving} /></label>
        <label>Care type<select name="type" disabled={saving}>{['Medication', 'Photo', 'Feeding', 'Measurement', 'Assessment', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label>
        <div className="grid two"><label>Due date<input name="date" type="date" defaultValue={clock.date} min={animal.admitted} required disabled={saving} /></label>
          <label>Due time<input name="time" type="time" defaultValue={clock.time} required disabled={saving} /></label></div>
        <button className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Schedule task'}</button>
      </form></section> : null}
    </div>
  </>
}

export function NewAnimal({ mode = 'create' }) {
  const workspace = useOutletContext()
  const { id } = useParams()
  const animal = workspace.animals.find((item) => item.id === id)
  if (mode !== 'create' && !animal) return <MissingAnimal />
  return <AnimalForm key={`${mode}-${id || 'new'}`} mode={mode} animal={animal} workspace={workspace} />
}

function AnimalForm({ mode, animal, workspace }) {
  const { saveAnimal, clock, saving } = workspace
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  // Retain the version the form opened with, rather than overwriting a newer edit.
  const [version] = useState(animal?.version)
  const [admissionId] = useState(animal?.admissionId)
  const [initial] = useState(() => mode === 'readmit' ? { ...animal, admitted: clock.date, status: 'In treatment', reason: '', releasedOn: '' }
    : animal || { admitted: clock.date, status: 'In treatment' })
  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setErrors({}); setMessage('')
    try {
      const result = await saveAnimal({ ...values, action: mode, ...(animal ? { id: animal.id, version, admissionId } : {}) })
      navigate(`/dashboard/animals/${result.id}`, { state: { created: true }, replace: true })
    } catch (failure) {
      setMessage(failure.message)
      setErrors(Object.fromEntries((failure.errors || []).map((entry) => [entry.field, entry.message])))
    }
  }
  const title = mode === 'update' ? 'Update care details' : mode === 'readmit' ? 'Begin a new admission' : 'A new journey begins.'
  return <><PageHeader title={title} description="Record an animal’s details and care needs." />
    <form className="card intake-form" onSubmit={submit} aria-busy={saving}><h2>Animal details</h2>
      <div className="grid two">{[['name', 'Animal name'], ['species', 'Species'], ['location', 'Care location'], ['carer', 'Assigned carer']].map(([field, label]) => <label key={field}>{label}
        <input name={field} defaultValue={initial[field] || ''} required maxLength={80} disabled={saving} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} />
        {errors[field] ? <small id={`${field}-error`} className="field-error">{errors[field]}</small> : null}</label>)}
        <label>Admission date<input name="admitted" type="date" defaultValue={initial.admitted} min={mode === 'readmit' ? animal.releasedOn : undefined} max={clock.date} required disabled={saving} aria-invalid={Boolean(errors.admitted)} />
          {errors.admitted ? <small className="field-error">{errors.admitted}</small> : null}</label>
        <label>Care status<select name="status" defaultValue={initial.status} disabled={saving}>{statuses.filter((status) => mode !== 'readmit' || status !== 'Released').map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Release date, if released<input name="releasedOn" type="date" defaultValue={initial.releasedOn || ''} max={clock.date} disabled={saving} /></label>
      </div>
      <label>Reason for admission<textarea name="reason" rows={4} defaultValue={initial.reason || ''} required maxLength={1000} disabled={saving} aria-invalid={Boolean(errors.reason)} />
        {errors.reason ? <small className="field-error">{errors.reason}</small> : null}</label>
      {message ? <p className="field-error" role="alert">{message}</p> : null}
      <div className="form-actions"><Link className="button secondary" to={animal ? `/dashboard/animals/${animal.id}` : '/dashboard/animals'}>Cancel</Link>
        <button className="button primary" disabled={saving}>{saving ? 'Saving…' : mode === 'create' ? 'Add animal →' : 'Save record'}</button>
        {message ? <button className="button secondary" type="button" onClick={() => navigate(animal ? `/dashboard/animals/${animal.id}` : '/dashboard/animals')}>Return to records</button> : null}
      </div>
    </form></>
}

export function Reports() {
  const { clock } = useOutletContext()
  const { refresh } = useAuth()
  const [range, setRange] = useState({ from: clock.date.slice(0, 7) + '-01', to: clock.date })
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const query = new URLSearchParams(range).toString()
  useEffect(() => {
    const controller = new AbortController()
    apiRequest(`reports.php?${query}`, { signal: controller.signal }).then((value) => { if (!controller.signal.aborted) setReport(value) })
      .catch((failure) => { if (failure.name !== 'AbortError' && !controller.signal.aborted) { setError(failure.message); if ([401, 428].includes(failure.status)) refresh() } })
    return () => controller.abort()
  }, [query, attempt, refresh])
  function applyRange(event) { event.preventDefault(); setReport(null); setError(''); setRange(Object.fromEntries(new FormData(event.currentTarget))); setAttempt((value) => value + 1) }
  async function download() {
    setDownloading(true); setError('')
    try {
      const response = await fetch(`/api/reports.php?${query}&format=csv`, { credentials: 'same-origin' })
      if (!response.ok) { const result = await response.json(); throw new Error(result.message || 'Could not download the report.') }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url; link.download = `tcsa-admissions-${range.from}-to-${range.to}.csv`
      document.body.appendChild(link); link.click(); link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (failure) { setError(failure.message) }
    finally { setDownloading(false) }
  }
  return <><PageHeader title="Care, in perspective." description="Review admissions, releases and completed care actions for a selected period." />
    <form className="card intake-form" onSubmit={applyRange}><div className="grid two">
      <label>From<input name="from" type="date" defaultValue={range.from} max={clock.date} required /></label>
      <label>To<input name="to" type="date" defaultValue={range.to} max={clock.date} required /></label>
    </div><div className="form-actions"><button className="button primary">Apply dates</button><button className="button secondary" type="button" disabled={!report || downloading} onClick={download}>{downloading ? 'Preparing…' : 'Download admissions CSV'}</button></div></form>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    {!report && !error ? <p role="status">Loading report…</p> : null}
    {report ? <><div className="summary-grid">{[['Admissions', report.admissions], ['Releases', report.releases], ['Completed tasks', report.completedTasks]].map(([label, count]) => <article className="card summary-stat" key={label}><strong>{count}</strong><p>{label}</p></article>)}</div>
      <section className="card"><div className="section-heading"><h2>Admissions by current care status</h2><span>{report.from} to {report.to}</span></div>
        <div className="report-bars">{statuses.map((status) => <div key={status}><div className="section-heading"><Status value={status} /><strong>{report.statuses[status]}</strong></div>
          <meter min="0" max={report.admissions || 1} value={report.statuses[status]} aria-label={`${status}: ${report.statuses[status]} of ${report.admissions} admissions`} /></div>)}</div>
      </section></> : null}
  </>
}
