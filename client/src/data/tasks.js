// Fictional care actions used by tests only, not veterinary instructions.
// The workspace receives its schedule and clock from PHP.
function currentClock() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map(({ type, value }) => [type, value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}
export const taskFilters = ['All tasks', 'Overdue', 'Upcoming', 'Completed']
export const initialTasks = [
  { id: 'TASK-01', animalId: 'TCSA-001', time: '09:00', title: 'Scheduled medication', type: 'Medication', completed: false },
  { id: 'TASK-02', animalId: 'TCSA-002', time: '10:30', title: 'Progress photo', type: 'Photo', completed: false },
  { id: 'TASK-03', animalId: 'TCSA-003', time: '12:00', title: 'Confirm feeding', type: 'Feeding', completed: false },
  { id: 'TASK-04', animalId: 'TCSA-005', time: '15:00', title: 'Scheduled medication', type: 'Medication', completed: false },
  { id: 'TASK-05', animalId: 'TCSA-001', time: '17:00', title: 'Weekly shell measurement', type: 'Measurement', completed: false },
  { id: 'TASK-06', animalId: 'TCSA-001', time: '07:30', title: 'Morning feed', type: 'Feeding', completed: true },
]

export function taskStatus(task, clock = currentClock()) {
  if (task.completed) return 'Completed'
  return `${task.date || clock.date}T${task.time}` < `${clock.date}T${clock.time}` ? 'Overdue' : 'Upcoming'
}

export function taskCounts(tasks, clock = currentClock()) {
  return tasks.reduce((counts, task) => {
    counts[taskStatus(task, clock)] += 1
    counts.Total += 1
    return counts
  }, { Overdue: 0, Upcoming: 0, Completed: 0, Total: 0 })
}

export function priorityTasks(tasks, filter = 'All tasks', clock = currentClock()) {
  const priority = { Overdue: 0, Upcoming: 1, Completed: 2 }
  return tasks.filter((task) => filter === 'All tasks' || taskStatus(task, clock) === filter)
    .sort((a, b) => priority[taskStatus(a, clock)] - priority[taskStatus(b, clock)] || `${a.date || ''}T${a.time}`.localeCompare(`${b.date || ''}T${b.time}`))
}

export function todayTasks(tasks, clock) {
  return tasks.filter((task) => task.completed ? task.completedAt === clock.date : task.date <= clock.date)
}

export function updateTaskCompletion(tasks, id, completed) {
  return tasks.map((task) => task.id === id ? { ...task, completed } : task)
}
