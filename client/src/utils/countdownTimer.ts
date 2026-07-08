import { computed, ref } from 'vue'

const endsAt = ref<number>(0)
const nowTs = ref<number>(Date.now())
let notified = false

setInterval(() => {
  nowTs.value = Date.now()
  if (endsAt.value > 0 && nowTs.value >= endsAt.value && !notified) {
    notified = true
    fireCallbacks()
  }
}, 500)

type Listener = () => void
const listeners: Listener[] = []

function fireCallbacks() {
  for (const fn of listeners) {
    try { fn() } catch { /* ignore */ }
  }
}

export const timerRunning = computed(
  () => endsAt.value > 0 && nowTs.value < endsAt.value,
)

export const timerRemainingMs = computed(() =>
  timerRunning.value ? endsAt.value - nowTs.value : 0,
)

export const timerLabel = computed(() => {
  const ms = Math.max(0, timerRemainingMs.value)
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

export function startCountdown(minutes: number): void {
  notified = false
  endsAt.value = Date.now() + minutes * 60_000
}

export function stopCountdown(): void {
  notified = false
  endsAt.value = 0
}

export function onCountdownExpiry(fn: Listener): () => void {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i >= 0) listeners.splice(i, 1)
  }
}
