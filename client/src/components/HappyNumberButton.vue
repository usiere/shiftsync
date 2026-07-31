<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Happy number checker"
        size="large"
      >
        <v-icon size="22">mdi-emoticon-happy-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Happy Number</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="hn-badge" :class="{ 'hn-badge--yes': isHappy, 'hn-badge--no': !isHappy }">
          {{ isHappy ? 'Happy :)' : 'Sad :(' }}
        </div>
        <div class="hn-trace">
          <span v-for="(v, i) in trace" :key="i" class="hn-pill">{{ v }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(19)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter a positive integer'
  if (v > 1_000_000) return 'Max is 1,000,000'
  return ''
})

const trace = computed<number[]>(() => {
  if (error.value) return []
  const seen = new Set<number>()
  const out: number[] = []
  let cur = Number(n.value)
  while (cur !== 1 && !seen.has(cur)) {
    seen.add(cur)
    out.push(cur)
    cur = String(cur).split('').reduce((s, d) => s + Number(d) ** 2, 0)
  }
  out.push(cur)
  return out
})

const isHappy = computed(() => trace.value[trace.value.length - 1] === 1)
</script>

<style scoped>
.hn-badge {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.hn-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.hn-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}

.hn-trace {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.hn-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #FEF3C7;
  color: #92400E;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
