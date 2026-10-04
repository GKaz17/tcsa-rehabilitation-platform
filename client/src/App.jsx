import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DashboardLayout, PublicLayout } from './components/Layouts'
import { initialAnimals } from './data/animals'
import { About, Contact, Landing, Login, NotFound } from './pages/Public'
import {
  AnimalList,
  AnimalProfile,
  NewAnimal,
  Overview,
  Reports,
} from './pages/Dashboard'
import './App.css'

export default function App() {
  const [animals, setAnimals] = useState(initialAnimals)
  function addAnimal(animal) {
    setAnimals((current) => [animal, ...current])
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="dashboard"
          element={<DashboardLayout animals={animals} addAnimal={addAnimal} />}
        >
          <Route index element={<Overview />} />
          <Route path="animals" element={<AnimalList />} />
          <Route path="animals/new" element={<NewAnimal />} />
          <Route path="animals/:id" element={<AnimalProfile />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
