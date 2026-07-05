import { computed, ref } from 'vue'

const STORAGE_KEY = 'shiftsync.snoozeUntil'

function readUntil(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

const snoozeUntil = ref<number>(readUntil())
const nowTs = ref<number>(Date.now())

setInterval(() => {
  nowTs.value = Date.now()
}, 1000)

export const snoozeActive = computed(() => snoozeUntil.value > nowTs.value)

export const snoozeMinutesLeft = computed(() => {
  const ms = snoozeUntil.value - nowTs.value
  return ms > 0 ? Math.ceil(ms / 60_000) : 0
})

export function snoozeFor(minutes: number): void {
  const until = Date.now() + minutes * 60_000
  snoozeUntil.value = until
  try {
    localStorage.setItem(STORAGE_KEY, String(until))
  } catch {
    /* ignore */
  }
}

export function clearSnooze(): void {
  snoozeUntil.value = 0
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
