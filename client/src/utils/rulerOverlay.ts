import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.rulerOverlay'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const rulerEnabled = ref<boolean>(read())

watch(rulerEnabled, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
})

export function toggleRuler(): void {
  rulerEnabled.value = !rulerEnabled.value
}
