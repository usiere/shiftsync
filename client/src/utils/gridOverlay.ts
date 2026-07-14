import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.gridOverlay'
const SIZE_KEY = 'shiftsync.gridOverlaySize'

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function readSize(): number {
  try {
    const raw = localStorage.getItem(SIZE_KEY)
    const n = raw ? parseInt(raw, 10) : 8
    return Number.isFinite(n) && n > 0 ? n : 8
  } catch {
    return 8
  }
}

export const gridOverlayEnabled = ref<boolean>(readEnabled())
export const gridOverlaySize = ref<number>(readSize())

watch(gridOverlayEnabled, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
})

watch(gridOverlaySize, (value) => {
  try {
    localStorage.setItem(SIZE_KEY, String(value))
  } catch {
    /* ignore */
  }
})

export function toggleGridOverlay(): void {
  gridOverlayEnabled.value = !gridOverlayEnabled.value
}
