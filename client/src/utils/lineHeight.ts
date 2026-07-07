import { ref, watch } from 'vue'

export type LineHeightChoice = 'tight' | 'normal' | 'relaxed' | 'loose'

const STORAGE_KEY = 'shiftsync.lineHeight'
const DEFAULT: LineHeightChoice = 'normal'
const CHOICES: LineHeightChoice[] = ['tight', 'normal', 'relaxed', 'loose']
const CSS_VAR = '--app-line-height'
const VALUES: Record<LineHeightChoice, string> = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
}

function read(): LineHeightChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && (CHOICES as string[]).includes(raw)) return raw as LineHeightChoice
  } catch {
    /* ignore */
  }
  return DEFAULT
}

export const lineHeight = ref<LineHeightChoice>(read())

function apply(value: LineHeightChoice) {
  document.documentElement.style.setProperty(CSS_VAR, VALUES[value])
  for (const c of CHOICES) {
    document.body.classList.toggle(`line-height-${c}`, c === value)
  }
}

apply(lineHeight.value)

watch(lineHeight, (value) => {
  try {
    if (value === DEFAULT) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function setLineHeight(value: LineHeightChoice): void {
  lineHeight.value = value
}
