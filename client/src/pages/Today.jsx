import { useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import { priorityTasks, taskCounts, taskFilters, taskStatus, todayTasks } from '../data/tasks'

export default function Today() {
  const { animals, tasks, completeTask, clock, saving } = useOutletContext()
  const [filter, setFilter] = useState('All tasks')
  const [announcement, setAnnouncement] = useState('')
  const [error, setError] = useState('')
  const filterControl = useRef(null)
  const currentTasks = todayTasks(tasks, clock)
  const counts = taskCounts(currentTasks, clock)
  const visible = priorityTasks(currentTasks, filter, clock)

  async function changeCompletion(task) {
    setError('')
    try {
      await completeTask(task.id, !task.completed)
      setAnnouncement(`${task.title} ${task.completed ? 'reopened' : 'completed'}.`)
    } catch (failure) { setError(failure.message); return }
    // Keep keyboard focus on a visible control when a filtered row disappears.
    if (filter !== 'All tasks') filterControl.current?.focus()
  }

  return (
    <>
      <PageHeader eyebrow={new Intl.DateTimeFormat('en-ZA', { dateStyle: 'full', timeZone: clock.timezone }).format(new Date(`${clock.date}T12:00:00+02:00`))} title="Today’s Tasks"
        description={`Your care plan for today · ${counts.Completed} of ${counts.Total} tasks completed`} />
      <div className="summary-grid task-summary" aria-label="Task summary">
        {['Overdue', 'Upcoming', 'Completed', 'Total'].map((label) => (
          <article className={`card summary-stat ${label.toLowerCase()}`} key={label}>
            <p>{label === 'Completed' ? 'Completed today' : label === 'Total' ? 'Total tasks' : label}</p>
            <strong>{counts[label]}</strong>
          </article>
        ))}
      </div>
      <section className="card task-panel" aria-labelledby="task-timeline-title">
        <div className="section-heading">
          <div><h2 id="task-timeline-title">Priority Task Timeline</h2><p>Care actions ordered by time and urgency.</p></div>
          <label className="task-filter">Show tasks
            <select ref={filterControl} value={filter} onChange={(event) => setFilter(event.target.value)}>
              {taskFilters.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        {visible.length ? <ol className="task-timeline">
          {visible.map((task) => {
            const animal = animals.find((record) => record.id === task.animalId)
            const status = taskStatus(task, clock)
            return <li className={`task-row ${status.toLowerCase()}`} key={task.id}>
              <time dateTime={`${task.date}T${task.time}`}>{task.date < clock.date ? `${task.date} · ` : ''}{task.time}</time>
              <div className="task-animal"><span className="task-dot" aria-hidden="true" /><Link to={`/dashboard/animals/${task.animalId}`}>{animal?.name || task.animalId}<small>{task.animalId}</small></Link></div>
              <h3>{task.title}</h3>
              <span className="task-type">{task.type}</span>
              <span className={`status ${status === 'Overdue' ? 'orange' : status === 'Completed' ? 'green' : 'neutral'}`}>{status}</span>
              <button type="button" className={`button ${task.completed ? 'secondary' : 'primary'}`}
                disabled={saving}
                aria-label={`${task.completed ? 'Undo completion of' : 'Mark complete:'} ${task.title} for ${animal?.name || task.animalId}`}
                onClick={() => changeCompletion(task)}>{task.completed ? 'Undo' : 'Mark complete'}</button>
            </li>
          })}
        </ol> : <div className="empty"><h3>{filter === 'All tasks' ? 'No care tasks due today.' : `No ${filter.toLowerCase()} tasks.`}</h3><p>Open an animal’s record to schedule care, or choose another task view.</p><Link className="button secondary" to="/dashboard/animals">View animals</Link></div>}
      </section>
    </>
  )
}
