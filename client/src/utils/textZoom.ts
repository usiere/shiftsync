import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.textZoom'
const MIN = 0.85
const MAX = 1.3
const STEP = 0.05
const DEFAULT = 1

function clamp(value: number): number {
  if (Number.isNaN(value)) return DEFAULT
  return Math.min(MAX, Math.max(MIN, Math.round(value * 100) / 100))
}

function read(): number {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT
  const parsed = parseFloat(raw)
  return clamp(parsed)
}

export const textZoom = ref<number>(read())

function apply(value: number) {
  document.documentElement.style.setProperty('--app-text-zoom', String(value))
}

apply(textZoom.value)

watch(textZoom, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    /* ignore */
  }
  apply(value)
})

export function increaseZoom(): void {
  textZoom.value = clamp(textZoom.value + STEP)
}

export function decreaseZoom(): void {
  textZoom.value = clamp(textZoom.value - STEP)
}

export function resetZoom(): void {
  textZoom.value = DEFAULT
}

export const TEXT_ZOOM_MIN = MIN
export const TEXT_ZOOM_MAX = MAX
