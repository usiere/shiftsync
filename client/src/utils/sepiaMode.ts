import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.sepiaMode'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const sepiaMode = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('sepia-mode', value)
}

apply(sepiaMode.value)

watch(sepiaMode, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleSepiaMode(): void {
  sepiaMode.value = !sepiaMode.value
}
