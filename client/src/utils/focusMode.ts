import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.focusMode'

function read(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export const focusMode = ref<boolean>(read())

function apply(value: boolean) {
  document.documentElement.classList.toggle('app-focus-mode', value)
}

apply(focusMode.value)

watch(focusMode, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleFocusMode(): void {
  focusMode.value = !focusMode.value
}
