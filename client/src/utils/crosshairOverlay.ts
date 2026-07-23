import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.crosshairOverlay'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const crosshairEnabled = ref<boolean>(read())

watch(crosshairEnabled, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
})

export function toggleCrosshair(): void {
  crosshairEnabled.value = !crosshairEnabled.value
}
