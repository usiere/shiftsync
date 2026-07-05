import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.underlineLinks'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const underlineLinks = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('underline-links', value)
}

apply(underlineLinks.value)

watch(underlineLinks, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleUnderlineLinks(): void {
  underlineLinks.value = !underlineLinks.value
}
