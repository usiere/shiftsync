import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.reducedMotion'

export type ReducedMotionPref = 'system' | 'on' | 'off'

function read(): ReducedMotionPref {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'on' || raw === 'off' ? raw : 'system'
}

export const reducedMotionPref = ref<ReducedMotionPref>(read())

function systemPrefersReduced(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function effective(pref: ReducedMotionPref): boolean {
  if (pref === 'on') return true
  if (pref === 'off') return false
  return systemPrefersReduced()
}

function apply(pref: ReducedMotionPref) {
  document.documentElement.classList.toggle('app-reduced-motion', effective(pref))
}

apply(reducedMotionPref.value)

watch(reducedMotionPref, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply(value)
})

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const onChange = () => {
    if (reducedMotionPref.value === 'system') apply('system')
  }
  if (mq.addEventListener) {
    mq.addEventListener('change', onChange)
  } else if ((mq as MediaQueryList & { addListener?: (cb: () => void) => void }).addListener) {
    ;(mq as MediaQueryList & { addListener: (cb: () => void) => void }).addListener(onChange)
  }
}

export function setReducedMotion(value: ReducedMotionPref): void {
  reducedMotionPref.value = value
}
