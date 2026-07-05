import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.clockShowSeconds'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const clockShowSeconds = ref<boolean>(read())

watch(clockShowSeconds, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
})

export function toggleClockSeconds(): void {
  clockShowSeconds.value = !clockShowSeconds.value
}
