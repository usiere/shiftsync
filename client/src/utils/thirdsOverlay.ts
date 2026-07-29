import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.thirdsOverlay'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const thirdsEnabled = ref<boolean>(read())

watch(thirdsEnabled, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
})

export function toggleThirds(): void {
  thirdsEnabled.value = !thirdsEnabled.value
}
