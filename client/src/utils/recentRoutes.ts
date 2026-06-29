const STORAGE_KEY = 'shiftsync.recentRoutes'
const MAX_RECENTS = 5

export function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((r): r is string => typeof r === 'string').slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function pushRecent(route: string): void {
  if (!route || route === '/' || route === '/login') return
  const current = loadRecents().filter(r => r !== route)
  current.unshift(route)
  const next = current.slice(0, MAX_RECENTS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
