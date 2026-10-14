import { Routes, Route, StaticRouter } from 'react-router-dom'
import { PublicLayout } from './components/Layouts'
import Landing from './pages/Landing'

// The same public components are rendered at build time, without staff fixtures.
export default function PublicDocument() {
  return <StaticRouter location="/"><Routes><Route element={<PublicLayout />}>
    <Route index element={<Landing />} />
  </Route></Routes></StaticRouter>
}
