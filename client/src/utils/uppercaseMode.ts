import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.uppercaseMode'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const uppercaseMode = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('uppercase-mode', value)
}

apply(uppercaseMode.value)

watch(uppercaseMode, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleUppercaseMode(): void {
  uppercaseMode.value = !uppercaseMode.value
}
