import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.pageTitleSuffix'
const BASE_TITLE = 'ShiftSync'
const MAX_LEN = 40

function read(): string {
  try {
    return (localStorage.getItem(STORAGE_KEY) || '').slice(0, MAX_LEN)
  } catch {
    return ''
  }
}

export const pageTitleSuffix = ref<string>(read())

function apply(suffix: string): void {
  const trimmed = suffix.trim()
  document.title = trimmed ? `${BASE_TITLE} • ${trimmed}` : BASE_TITLE
}

apply(pageTitleSuffix.value)

watch(pageTitleSuffix, (value) => {
  const clean = value.slice(0, MAX_LEN)
  try {
    if (clean) localStorage.setItem(STORAGE_KEY, clean)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(clean)
})

export function setPageTitleSuffix(value: string): void {
  pageTitleSuffix.value = value
}

export function clearPageTitleSuffix(): void {
  pageTitleSuffix.value = ''
}

export const PAGE_TITLE_MAX = MAX_LEN
export const PAGE_TITLE_BASE = BASE_TITLE
