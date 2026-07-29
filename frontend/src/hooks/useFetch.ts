import { useState, useEffect } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = (await res.json()) as T
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (err) {
        if (!cancelled) setState({ data: null, loading: false, error: (err as Error).message })
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [url])

  return state
}

export default useFetch
