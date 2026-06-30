import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.density'

export type Density = 'compact' | 'comfortable'

function read(): Density {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'compact' ? 'compact' : 'comfortable'
}

export const density = ref<Density>(read())

function apply(value: Density) {
  document.documentElement.dataset.density = value
}

apply(density.value)

watch(density, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function setDensity(value: Density): void {
  density.value = value
}
