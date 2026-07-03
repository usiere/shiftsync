import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.highContrast'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const highContrast = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('hc-mode', value)
}

apply(highContrast.value)

watch(highContrast, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleHighContrast(): void {
  highContrast.value = !highContrast.value
}
