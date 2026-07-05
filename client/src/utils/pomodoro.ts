import { computed, ref } from 'vue'

export type PomodoroMode = 'work' | 'break'

const WORK_MIN = 25
const BREAK_MIN = 5

const running = ref(false)
const mode = ref<PomodoroMode>('work')
const endsAt = ref<number>(0)
const nowTs = ref<number>(Date.now())

setInterval(() => {
  nowTs.value = Date.now()
  if (running.value && nowTs.value >= endsAt.value) {
    mode.value = mode.value === 'work' ? 'break' : 'work'
    const minutes = mode.value === 'work' ? WORK_MIN : BREAK_MIN
    endsAt.value = Date.now() + minutes * 60_000
  }
}, 1000)

export const pomodoroRunning = computed(() => running.value)
export const pomodoroMode = computed(() => mode.value)

export const pomodoroRemainingMs = computed(() =>
  running.value ? Math.max(0, endsAt.value - nowTs.value) : 0,
)

export const pomodoroLabel = computed(() => {
  const ms = pomodoroRemainingMs.value
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

export function startPomodoro(): void {
  mode.value = 'work'
  endsAt.value = Date.now() + WORK_MIN * 60_000
  running.value = true
}

export function stopPomodoro(): void {
  running.value = false
  endsAt.value = 0
}

export function skipPomodoroPhase(): void {
  if (!running.value) return
  mode.value = mode.value === 'work' ? 'break' : 'work'
  const minutes = mode.value === 'work' ? WORK_MIN : BREAK_MIN
  endsAt.value = Date.now() + minutes * 60_000
}
