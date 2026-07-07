import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.invertColors'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const invertColors = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('invert-colors', value)
}

apply(invertColors.value)

watch(invertColors, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleInvertColors(): void {
  invertColors.value = !invertColors.value
}
