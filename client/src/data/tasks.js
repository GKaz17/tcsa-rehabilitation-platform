// Fictional care actions, not veterinary instructions. The fixed fixture clock
// makes overdue/upcoming states reproducible until the server owns scheduling.
export const careDate = '2026-10-05'
export const careTime = '10:00'
export const taskFilters = ['All tasks', 'Overdue', 'Upcoming', 'Completed']
export const initialTasks = [
  { id: 'TASK-01', animalId: 'TCSA-001', time: '09:00', title: 'Scheduled medication', type: 'Medication', completed: false },
  { id: 'TASK-02', animalId: 'TCSA-002', time: '10:30', title: 'Progress photo', type: 'Photo', completed: false },
  { id: 'TASK-03', animalId: 'TCSA-003', time: '12:00', title: 'Confirm feeding', type: 'Feeding', completed: false },
  { id: 'TASK-04', animalId: 'TCSA-005', time: '15:00', title: 'Scheduled medication', type: 'Medication', completed: false },
  { id: 'TASK-05', animalId: 'TCSA-001', time: '17:00', title: 'Weekly shell measurement', type: 'Measurement', completed: false },
  { id: 'TASK-06', animalId: 'TCSA-001', time: '07:30', title: 'Morning feed', type: 'Feeding', completed: true },
]

export function taskStatus(task) {
  if (task.completed) return 'Completed'
  return task.time < careTime ? 'Overdue' : 'Upcoming'
}

export function taskCounts(tasks) {
  return tasks.reduce((counts, task) => {
    counts[taskStatus(task)] += 1
    counts.Total += 1
    return counts
  }, { Overdue: 0, Upcoming: 0, Completed: 0, Total: 0 })
}

export function priorityTasks(tasks, filter = 'All tasks') {
  const priority = { Overdue: 0, Upcoming: 1, Completed: 2 }
  return tasks.filter((task) => filter === 'All tasks' || taskStatus(task) === filter)
    .sort((a, b) => priority[taskStatus(a)] - priority[taskStatus(b)] || a.time.localeCompare(b.time))
}

export function updateTaskCompletion(tasks, id, completed) {
  return tasks.map((task) => task.id === id ? { ...task, completed } : task)
}
