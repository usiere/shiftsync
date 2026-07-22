import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.compactScroll'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const compactScroll = ref<boolean>(read())

function apply(v: boolean) {
  document.body.classList.toggle('compact-scroll', v)
}

apply(compactScroll.value)

watch(compactScroll, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleCompactScroll(): void {
  compactScroll.value = !compactScroll.value
}
