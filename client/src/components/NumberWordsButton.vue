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
        title="Number to words"
        size="large"
      >
        <v-icon size="22">mdi-numeric-9-plus</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-text-field
        v-model="input"
        type="number"
        label="Number"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div class="nw-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else class="nw-out__value">{{ words || '—' }}</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!words || !!error" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const error = ref('')
const notify = useNotificationStore()

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion']

function below1000(n: number): string {
  const parts: string[] = []
  const h = Math.floor(n / 100)
  const rest = n % 100
  if (h) parts.push(`${ONES[h]} hundred`)
  if (rest < 20 && rest > 0) parts.push(ONES[rest])
  else if (rest >= 20) {
    const t = Math.floor(rest / 10)
    const o = rest % 10
    parts.push(o ? `${TENS[t]}-${ONES[o]}` : TENS[t])
  }
  return parts.join(' ')
}

function toWords(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const negative = trimmed.startsWith('-')
  const clean = trimmed.replace(/^-/, '')
  if (!/^\d+(?:\.\d+)?$/.test(clean)) throw new Error('Only whole/decimal numbers supported')
  const [intPart, decPart] = clean.split('.')
  let n = parseInt(intPart, 10)
  if (n > 999_999_999_999_999) throw new Error('Too large (max 999 trillion)')

  let words: string
  if (n === 0) words = 'zero'
  else {
    const chunks: string[] = []
    let scale = 0
    while (n > 0) {
      const c = n % 1000
      if (c) chunks.unshift(SCALES[scale] ? `${below1000(c)} ${SCALES[scale]}` : below1000(c))
      n = Math.floor(n / 1000)
      scale++
    }
    words = chunks.join(' ')
  }
  if (negative) words = `negative ${words}`
  if (decPart) {
    const decWords = decPart.split('').map((d) => ONES[parseInt(d, 10)] || 'zero').join(' ')
    words += ` point ${decWords}`
  }
  return words
}

const words = computed(() => {
  error.value = ''
  if (!input.value.trim()) return ''
  try {
    return toWords(input.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid input'
    return ''
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(words.value)
    notify.showToast({
      type: 'success',
      title: 'Number in words copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.nw-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.nw-out__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  line-height: 1.5;
}
</style>
