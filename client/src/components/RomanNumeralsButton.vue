<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Roman numerals converter"
        size="large"
      >
        <v-icon size="22">mdi-roman-numeral-1</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model="arabic"
          type="number"
          label="Arabic"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromArabic"
        />
        <v-text-field
          v-model="roman"
          label="Roman"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromRoman"
        />
      </div>
      <div v-if="error" class="text-error text-caption">{{ error }}</div>
      <div v-else-if="arabic" class="text-caption text-medium-emphasis">
        Valid range: 1 – 3999
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const arabic = ref('')
const roman = ref('')
const error = ref('')

const PAIRS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

function toRoman(n: number): string {
  let out = ''
  let remaining = n
  for (const [val, sym] of PAIRS) {
    while (remaining >= val) {
      out += sym
      remaining -= val
    }
  }
  return out
}

function fromRomanStr(input: string): number {
  const s = input.trim().toUpperCase()
  if (!/^[MDCLXVI]+$/.test(s)) throw new Error('Only M D C L X V I allowed')
  const map: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]]
    const next = map[s[i + 1]] ?? 0
    total += cur < next ? -cur : cur
  }
  const round = toRoman(total)
  if (round !== s) throw new Error('Malformed numeral')
  return total
}

function fromArabic(raw: string) {
  error.value = ''
  arabic.value = raw
  const n = parseInt(raw, 10)
  if (!raw) { roman.value = ''; return }
  if (!Number.isFinite(n) || n < 1 || n > 3999) {
    error.value = 'Must be an integer 1–3999'
    roman.value = ''
    return
  }
  roman.value = toRoman(n)
}

function fromRoman(raw: string) {
  error.value = ''
  roman.value = raw
  if (!raw) { arabic.value = ''; return }
  try {
    arabic.value = String(fromRomanStr(raw))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid Roman numeral'
    arabic.value = ''
  }
}
</script>

<style scoped>
.gap-8 {
  gap: 8px;
}
</style>
