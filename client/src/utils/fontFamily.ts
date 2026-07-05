import { ref, watch } from 'vue'

export type FontFamilyChoice = 'sans' | 'serif' | 'mono'

const STORAGE_KEY = 'shiftsync.fontFamily'
const DEFAULT: FontFamilyChoice = 'sans'
const CLASS_PREFIX = 'font-family-'

const CHOICES: FontFamilyChoice[] = ['sans', 'serif', 'mono']

function read(): FontFamilyChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && (CHOICES as string[]).includes(raw)) return raw as FontFamilyChoice
  } catch {
    /* ignore */
  }
  return DEFAULT
}

export const fontFamily = ref<FontFamilyChoice>(read())

function apply(value: FontFamilyChoice) {
  for (const c of CHOICES) {
    document.body.classList.toggle(`${CLASS_PREFIX}${c}`, c === value)
  }
}

apply(fontFamily.value)

watch(fontFamily, (value) => {
  try {
    if (value === DEFAULT) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply(value)
})

export function setFontFamily(value: FontFamilyChoice): void {
  fontFamily.value = value
}
