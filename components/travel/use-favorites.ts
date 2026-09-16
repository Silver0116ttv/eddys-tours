'use client'

import { useSyncExternalStore } from 'react'

const key = 'eddys.favorites.v1'
const empty: string[] = []
let snapshot = empty
let serialized = ''
let memoryOnly = false
function read() {
  if (memoryOnly) return snapshot
  try {
    const raw = localStorage.getItem(key) ?? '[]'
    if (raw !== serialized) {
      const value: unknown = JSON.parse(raw)
      snapshot = Array.isArray(value)
        ? value.filter((id): id is string => typeof id === 'string')
        : empty
      serialized = raw
    }
  } catch {
    return snapshot
  }
  return snapshot
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('favorites-change', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('favorites-change', callback)
  }
}
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => empty)
  function toggle(id: string) {
    const current = read()
    snapshot = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]
    serialized = JSON.stringify(snapshot)
    try {
      localStorage.setItem(key, serialized)
    } catch {
      memoryOnly = true
    }
    window.dispatchEvent(new Event('favorites-change'))
  }
  return { ids, toggle }
}
