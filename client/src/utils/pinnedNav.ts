import { ref } from 'vue'

const STORAGE_KEY = 'shiftsync.pinnedNav'

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((r): r is string => typeof r === 'string')
  } catch {
    return []
  }
}

function write(routes: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
  } catch {
    /* ignore */
  }
}

export const pinnedRoutes = ref<string[]>(read())

export function togglePinned(route: string): void {
  const i = pinnedRoutes.value.indexOf(route)
  if (i >= 0) {
    pinnedRoutes.value.splice(i, 1)
  } else {
    pinnedRoutes.value.push(route)
  }
  write(pinnedRoutes.value)
}

export function isPinned(route: string): boolean {
  return pinnedRoutes.value.includes(route)
}
