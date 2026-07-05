import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.stickyNote'

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export const stickyNote = ref<string>(read())

watch(stickyNote, (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
})

export function clearStickyNote(): void {
  stickyNote.value = ''
}
