import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.sidebarWidth'
const MIN = 180
const MAX = 320
const DEFAULT = 220

function clamp(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT
  return Math.min(MAX, Math.max(MIN, Math.round(v)))
}

function read(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    return clamp(parseInt(raw, 10))
  } catch {
    return DEFAULT
  }
}

export const sidebarWidth = ref<number>(read())

function apply(v: number) {
  document.documentElement.style.setProperty('--app-sidebar-width', `${v}px`)
}

apply(sidebarWidth.value)

watch(sidebarWidth, (v) => {
  const c = clamp(v)
  try {
    localStorage.setItem(STORAGE_KEY, String(c))
  } catch {
    /* ignore */
  }
  apply(c)
})

export function setSidebarWidth(v: number): void {
  sidebarWidth.value = clamp(v)
}

export function resetSidebarWidth(): void {
  sidebarWidth.value = DEFAULT
}

export const SIDEBAR_WIDTH_MIN = MIN
export const SIDEBAR_WIDTH_MAX = MAX
export const SIDEBAR_WIDTH_DEFAULT = DEFAULT
