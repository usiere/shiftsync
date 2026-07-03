import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.dnd'

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const doNotDisturb = ref<boolean>(read())

function apply(value: boolean) {
  document.body.classList.toggle('dnd-active', value)
}

apply(doNotDisturb.value)

watch(doNotDisturb, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function toggleDoNotDisturb(): void {
  doNotDisturb.value = !doNotDisturb.value
}
