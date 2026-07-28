<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Divisors listing"
        size="large"
      >
        <v-icon size="22">mdi-division</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Divisors</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer (≥ 1)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div class="dv-out">
        <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
        <template v-else>
          <div class="dv-list">
            <span v-for="d in divisors" :key="d" class="dv-pill">{{ d }}</span>
          </div>
          <div class="text-caption text-medium-emphasis text-center mt-2">
            {{ divisors.length }} divisor{{ divisors.length === 1 ? '' : 's' }} · sum {{ sum }}
          </div>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(24)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter an integer ≥ 1'
  if (v > 1_000_000) return 'Max is 1,000,000'
  return ''
})

const divisors = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const small: number[] = []
  const large: number[] = []
  const lim = Math.floor(Math.sqrt(v))
  for (let i = 1; i <= lim; i++) {
    if (v % i === 0) {
      small.push(i)
      if (i !== v / i) large.push(v / i)
    }
  }
  return small.concat(large.reverse())
})

const sum = computed(() => divisors.value.reduce((a, b) => a + b, 0))
</script>

<style scoped>
.dv-out {
  min-height: 60px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.dv-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  max-height: 130px;
  overflow-y: auto;
}

.dv-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 12px;
}
</style>
