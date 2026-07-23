import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.focusOutline'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const focusOutline = ref<boolean>(read())

function apply(v: boolean) {
  document.body.classList.toggle('force-focus-outline', v)
}

apply(focusOutline.value)

watch(focusOutline, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleFocusOutline(): void {
  focusOutline.value = !focusOutline.value
}
