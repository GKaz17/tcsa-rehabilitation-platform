import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialAnimals } from '../src/data/animals.js'
import { initialTasks, priorityTasks, taskCounts, taskStatus, updateTaskCompletion } from '../src/data/tasks.js'

test('completion and undo update counts without losing or mutating tasks', () => {
  const before = structuredClone(initialTasks)
  assert.deepEqual(taskCounts(initialTasks), { Overdue: 1, Upcoming: 4, Completed: 1, Total: 6 })
  const overdue = initialTasks.find((task) => taskStatus(task) === 'Overdue')
  const completed = updateTaskCompletion(initialTasks, overdue.id, true)
  assert.deepEqual(taskCounts(completed), { Overdue: 0, Upcoming: 4, Completed: 2, Total: 6 })
  assert.equal(priorityTasks(completed, 'Overdue').length, 0)
  assert.equal(priorityTasks(completed, 'Completed').length, 2)
  assert.deepEqual(updateTaskCompletion(completed, overdue.id, false), before)
  assert.deepEqual(initialTasks, before)
})

test('timeline prioritises overdue and upcoming work before completed actions', () => {
  const result = priorityTasks([...initialTasks].reverse())
  assert.deepEqual(result.map(taskStatus), ['Overdue', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming', 'Completed'])
  assert.deepEqual(result.slice(1, 5).map((task) => task.time), ['10:30', '12:00', '15:00', '17:00'])
  assert.equal(new Set(result.map((task) => task.id)).size, initialTasks.length)
})

test('all task categories are represented and link to existing animal records', () => {
  const animalIds = new Set(initialAnimals.map((animal) => animal.id))
  assert.deepEqual([...new Set(initialTasks.map((task) => task.type))].sort(), ['Feeding', 'Measurement', 'Medication', 'Photo'])
  assert.ok(initialTasks.every((task) => animalIds.has(task.animalId)))
  const allCompleted = initialTasks.map((task) => ({ ...task, completed: true }))
  assert.deepEqual(taskCounts(allCompleted), { Overdue: 0, Upcoming: 0, Completed: 6, Total: 6 })
  assert.deepEqual(taskCounts([]), { Overdue: 0, Upcoming: 0, Completed: 0, Total: 0 })
})
