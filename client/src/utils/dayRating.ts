import { computed, ref, watch } from 'vue'

interface Entry {
  date: string
  rating: number
}

const STORAGE_KEY = 'shiftsync.dayRatings'

function read(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is Entry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as Entry).date === 'string' &&
        typeof (e as Entry).rating === 'number',
    )
  } catch {
    return []
  }
}

export const ratings = ref<Entry[]>(read())

watch(
  ratings,
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

export const todayRating = computed<number>(() => {
  const t = today()
  return ratings.value.find((r) => r.date === t)?.rating ?? 0
})

export function rateToday(value: number): void {
  const t = today()
  const idx = ratings.value.findIndex((r) => r.date === t)
  if (idx >= 0) ratings.value[idx].rating = value
  else ratings.value.push({ date: t, rating: value })
  ratings.value = [...ratings.value].sort((a, b) => a.date.localeCompare(b.date))
}

export const averageRating = computed<number>(() => {
  if (!ratings.value.length) return 0
  const sum = ratings.value.reduce((a, r) => a + r.rating, 0)
  return sum / ratings.value.length
})

export const recentRatings = computed<Entry[]>(() =>
  ratings.value.slice(-7).reverse(),
)
