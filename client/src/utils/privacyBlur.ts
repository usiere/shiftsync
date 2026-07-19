import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.privacyBlur'
const AMOUNT_KEY = 'shiftsync.privacyBlurAmount'

function readEnabled(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

function readAmount(): number {
  try {
    const raw = localStorage.getItem(AMOUNT_KEY)
    const n = raw ? parseFloat(raw) : 6
    return Number.isFinite(n) && n > 0 ? n : 6
  } catch { return 6 }
}

export const privacyBlurEnabled = ref<boolean>(readEnabled())
export const privacyBlurAmount = ref<number>(readAmount())

function apply() {
  const active = privacyBlurEnabled.value
  document.body.classList.toggle('privacy-blur', active)
  document.documentElement.style.setProperty(
    '--privacy-blur',
    active ? `${privacyBlurAmount.value}px` : '0px',
  )
}

apply()

watch(privacyBlurEnabled, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  apply()
})

watch(privacyBlurAmount, (v) => {
  try { localStorage.setItem(AMOUNT_KEY, String(v)) } catch { /* ignore */ }
  apply()
})

export function togglePrivacyBlur(): void {
  privacyBlurEnabled.value = !privacyBlurEnabled.value
}
