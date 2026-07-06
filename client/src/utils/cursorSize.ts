import { ref, watch } from 'vue'

export type CursorSize = 'normal' | 'large' | 'xl'

const STORAGE_KEY = 'shiftsync.cursorSize'
const DEFAULT: CursorSize = 'normal'
const CLASSES: Record<CursorSize, string> = {
  normal: '',
  large: 'cursor-size-large',
  xl: 'cursor-size-xl',
}

const SIZES: CursorSize[] = ['normal', 'large', 'xl']

function read(): CursorSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && (SIZES as string[]).includes(raw)) return raw as CursorSize
  } catch {
    /* ignore */
  }
  return DEFAULT
}

export const cursorSize = ref<CursorSize>(read())

function apply(value: CursorSize) {
  for (const s of SIZES) {
    const cls = CLASSES[s]
    if (!cls) continue
    document.body.classList.toggle(cls, s === value)
  }
}

apply(cursorSize.value)

watch(cursorSize, (value) => {
  try {
    if (value === DEFAULT) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function setCursorSize(value: CursorSize): void {
  cursorSize.value = value
}
