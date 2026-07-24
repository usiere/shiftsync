import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.crtScanline'

function read(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export const crtScanline = ref<boolean>(read())

function apply(v: boolean) {
  document.body.classList.toggle('crt-scanline', v)
}

apply(crtScanline.value)

watch(crtScanline, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply(v)
})

export function toggleCrtScanline(): void {
  crtScanline.value = !crtScanline.value
}
