import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.rtlMode'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const rtlMode = ref<boolean>(read())

function apply(v: boolean) {
  document.documentElement.setAttribute('dir', v ? 'rtl' : 'ltr')
  document.body.classList.toggle('rtl-mode', v)
}

apply(rtlMode.value)

watch(rtlMode, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleRtlMode(): void {
  rtlMode.value = !rtlMode.value
}
