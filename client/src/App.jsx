import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout, PublicLayout } from './components/Layouts'
import { initialAnimals } from './data/animals'
import { NotFound } from './pages/Public'
import Login from './pages/Login'
import Today from './pages/Today'
import Animals from './pages/Animals'
import { initialTasks, updateTaskCompletion } from './data/tasks'
import Landing from './pages/Landing'
import {
  AnimalProfile,
  NewAnimal,
  Reports,
} from './pages/Dashboard'
import './App.css'
import './styles/workspace.css'
import './styles/glass-motion.css'

export default function App() {
  // Phase 1 uses fictional records in memory; changes reset on refresh.
  // No database persistence or authenticated session is implemented yet.
  const [animals, setAnimals] = useState(initialAnimals)
  const [tasks, setTasks] = useState(initialTasks)
  function addAnimal(animal) {
    setAnimals((current) => [animal, ...current])
  }
  function completeTask(id, completed) {
    setTasks((current) => updateTaskCompletion(current, id, completed))
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          {/* Preserve the reviewed one-page public content journey. */}
          <Route path="about" element={<Navigate to="/#about-us" replace />} />
          <Route path="contact" element={<Navigate to="/#contact-dirk" replace />} />
          <Route path="support" element={<Navigate to="/#support-us" replace />} />
          <Route path="education" element={<Navigate to="/#education" replace />} />
          <Route path="staff/login" element={<Login />} />
          <Route path="login" element={<Navigate to="/staff/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="dashboard"
          element={<DashboardLayout animals={animals} addAnimal={addAnimal} tasks={tasks} completeTask={completeTask} />}
        >
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="animals" element={<Animals />} />
          <Route path="animals/new" element={<NewAnimal />} />
          <Route path="animals/:id" element={<AnimalProfile />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
