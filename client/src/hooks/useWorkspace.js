import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, getWorkspace, saveCare } from '../lib/api'
import { useAuth } from '../auth/useAuth'

export default function useWorkspace() {
  const { csrfToken, refresh } = useAuth()
  const [data, setData] = useState({ animals: [], tasks: [], clock: null })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const generation = useRef(0)
  const mutating = useRef(false)
  const alive = useRef(true)
  const reload = useCallback(async (signal) => {
    const request = ++generation.current
    try {
      const next = await getWorkspace({ signal })
      if (!alive.current || request !== generation.current || signal?.aborted) return
      setData(next); setStatus('ready'); setError('')
    } catch (failure) {
      if (failure.name === 'AbortError' || !alive.current || request !== generation.current) return
      setStatus('error'); setError(failure.message)
      if (failure.status === 401 || failure.status === 428) await refresh()
    }
  }, [refresh])
  useEffect(() => {
    alive.current = true
    const controller = new AbortController()
    Promise.resolve().then(() => reload(controller.signal))
    return () => { alive.current = false; generation.current += 1; controller.abort() }
  }, [reload])
  useEffect(() => {
    const recheck = () => { if (!mutating.current && document.visibilityState === 'visible') reload() }
    const interval = window.setInterval(recheck, 60000)
    window.addEventListener('focus', recheck)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', recheck) }
  }, [reload])
  async function mutate(path, body) {
    if (mutating.current) throw new ApiError('Please wait for the current save to finish.')
    mutating.current = true
    generation.current += 1
    setSaving(true)
    try {
      const result = await saveCare(path, body, csrfToken)
      await reload()
      return result
    } catch (failure) {
      if ([401, 403, 428].includes(failure.status)) await refresh()
      if (failure.status === 409) await reload()
      throw failure
    } finally { mutating.current = false; if (alive.current) setSaving(false) }
  }
  return { ...data, status, error, saving, reload,
    saveAnimal: (body) => mutate('animals.php', body),
    addNote: (body) => mutate('history.php', body),
    saveTask: (body) => mutate('tasks.php', body),
    completeTask: (id, completed) => {
      const task = data.tasks.find((item) => item.id === id)
      if (!task) return Promise.reject(new ApiError('Care task not found. Reload the workspace.'))
      return mutate('tasks.php', { action: 'complete', id, animalId: task.animalId, admissionId: task.admissionId, version: task.version, completed })
    },
  }
}
