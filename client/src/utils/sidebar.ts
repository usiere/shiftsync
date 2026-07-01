import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.sidebarCollapsed'

function read(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export const sidebarCollapsed = ref<boolean>(read())

watch(sidebarCollapsed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
})

export function toggleSidebar(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
