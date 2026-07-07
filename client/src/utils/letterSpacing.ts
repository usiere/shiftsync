import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.letterSpacingWide'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const letterSpacingWide = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('letter-spacing-wide', value)
}

apply(letterSpacingWide.value)

watch(letterSpacingWide, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleLetterSpacing(): void {
  letterSpacingWide.value = !letterSpacingWide.value
}
