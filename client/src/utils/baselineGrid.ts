import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.baselineGrid'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const baselineGrid = ref<boolean>(read())

function apply(v: boolean) {
  document.body.classList.toggle('baseline-grid', v)
}

apply(baselineGrid.value)

watch(baselineGrid, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleBaselineGrid(): void {
  baselineGrid.value = !baselineGrid.value
}
