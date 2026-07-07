import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.grayscaleMode'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const grayscaleMode = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('grayscale-mode', value)
}

apply(grayscaleMode.value)

watch(grayscaleMode, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleGrayscaleMode(): void {
  grayscaleMode.value = !grayscaleMode.value
}
