import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.zebraRows'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const zebraRows = ref<boolean>(read())

function apply(v: boolean) {
  document.body.classList.toggle('zebra-rows', v)
}

apply(zebraRows.value)

watch(zebraRows, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleZebraRows(): void {
  zebraRows.value = !zebraRows.value
}
