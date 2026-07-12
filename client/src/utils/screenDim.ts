import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.screenDim'
const MIN = 0
const MAX = 0.7

function clamp(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(MIN, Math.min(MAX, v))
}

function read(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    return clamp(parseFloat(raw))
  } catch {
    return 0
  }
}

export const screenDim = ref<number>(read())

watch(screenDim, (value) => {
  const c = clamp(value)
  try {
    if (c === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, String(c))
  } catch {
    /* ignore */
  }
})

export function setScreenDim(v: number): void {
  screenDim.value = clamp(v)
}
