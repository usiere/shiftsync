import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.autoRefreshMinutes'

function readInterval(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export const autoRefreshMinutes = ref<number>(readInterval())

let timer: ReturnType<typeof setInterval> | null = null

function schedule(minutes: number) {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (minutes <= 0) return
  timer = setInterval(() => {
    window.location.reload()
  }, minutes * 60_000)
}

schedule(autoRefreshMinutes.value)

watch(autoRefreshMinutes, (value) => {
  try {
    if (value > 0) localStorage.setItem(STORAGE_KEY, String(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  schedule(value)
})

export function setAutoRefresh(minutes: number): void {
  autoRefreshMinutes.value = minutes > 0 ? minutes : 0
}
