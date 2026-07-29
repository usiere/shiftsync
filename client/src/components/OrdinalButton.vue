<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Ordinal number formatter"
        size="large"
      >
        <v-icon size="22">mdi-order-numeric-ascending</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Ordinal</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div class="od-out">
        <div class="od-num">{{ ordinal }}</div>
        <div class="text-caption text-medium-emphasis mt-1">{{ wordForm }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(23)

function suffix(x: number): string {
  const abs = Math.abs(Math.trunc(x))
  const mod100 = abs % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (abs % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

const ordinal = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v)) return '—'
  return `${v}${suffix(v)}`
})

const WORDS: Record<number, string> = {
  1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth',
  6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
  11: 'eleventh', 12: 'twelfth', 20: 'twentieth', 30: 'thirtieth',
  100: 'hundredth', 1000: 'thousandth',
}

const wordForm = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v)) return ''
  return WORDS[v] ? `“${WORDS[v]}”` : ''
})
</script>

<style scoped>
.od-out {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.od-num {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 26px;
  color: #1E40AF;
}
</style>
