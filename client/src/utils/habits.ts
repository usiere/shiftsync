import { ref, watch } from 'vue'

export interface Habit {
  id: string
  name: string
  history: string[]
}

const STORAGE_KEY = 'shiftsync.habits'

function read(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (h): h is Habit =>
        typeof h === 'object' &&
        h !== null &&
        typeof (h as Habit).id === 'string' &&
        typeof (h as Habit).name === 'string' &&
        Array.isArray((h as Habit).history),
    )
  } catch {
    return []
  }
}

export const habits = ref<Habit[]>(read())

watch(
  habits,
  (value) => {
    try {
      if (value.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  },
  { deep: true },
)

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addHabit(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  habits.value.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: trimmed,
    history: [],
  })
}

export function removeHabit(id: string): void {
  habits.value = habits.value.filter((h) => h.id !== id)
}

export function toggleToday(id: string): void {
  const t = today()
  const h = habits.value.find((x) => x.id === id)
  if (!h) return
  const idx = h.history.indexOf(t)
  if (idx >= 0) h.history.splice(idx, 1)
  else h.history = [...h.history, t].sort()
}

export function doneToday(h: Habit): boolean {
  return h.history.includes(today())
}

export function streak(h: Habit): number {
  const set = new Set(h.history)
  let count = 0
  const cursor = new Date()
  while (true) {
    const iso = cursor.toISOString().slice(0, 10)
    if (set.has(iso)) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }
  return count
}
