import { ref, watch } from 'vue'

export type AutoThemeMode = 'off' | 'sunset' | 'system'

const STORAGE_KEY = 'shiftsync.autoTheme'
const DEFAULT: AutoThemeMode = 'off'
const MODES: AutoThemeMode[] = ['off', 'sunset', 'system']

const SUNSET_START = 19
const SUNSET_END = 7

function read(): AutoThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && (MODES as string[]).includes(raw)) return raw as AutoThemeMode
  } catch {
    /* ignore */
  }
  return DEFAULT
}

export const autoThemeMode = ref<AutoThemeMode>(read())

type Applier = (name: 'light' | 'dark') => void
let apply: Applier = () => {}
let timer: ReturnType<typeof setInterval> | null = null
let mql: MediaQueryList | null = null

function currentDesiredTheme(mode: AutoThemeMode): 'light' | 'dark' | null {
  if (mode === 'system') {
    if (!mql) mql = window.matchMedia('(prefers-color-scheme: dark)')
    return mql.matches ? 'dark' : 'light'
  }
  if (mode === 'sunset') {
    const h = new Date().getHours()
    const isNight = h >= SUNSET_START || h < SUNSET_END
    return isNight ? 'dark' : 'light'
  }
  return null
}

function tick() {
  const want = currentDesiredTheme(autoThemeMode.value)
  if (want) apply(want)
}

function schedule(mode: AutoThemeMode) {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (mql) {
    mql.removeEventListener('change', tick)
    mql = null
  }
  if (mode === 'off') return
  if (mode === 'system') {
    mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', tick)
    tick()
    return
  }
  timer = setInterval(tick, 60_000)
  tick()
}

export function registerThemeApplier(fn: Applier): void {
  apply = fn
  tick()
}

watch(autoThemeMode, (value) => {
  try {
    if (value === DEFAULT) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  schedule(value)
})

schedule(autoThemeMode.value)

export function setAutoTheme(mode: AutoThemeMode): void {
  autoThemeMode.value = mode
}
