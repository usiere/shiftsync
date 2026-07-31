<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Armstrong (narcissistic) number check"
        size="large"
      >
        <v-icon size="22">mdi-star-four-points-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Armstrong Number</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="an-badge" :class="{ 'an-badge--yes': isArmstrong, 'an-badge--no': !isArmstrong }">
          {{ isArmstrong ? 'Armstrong!' : 'Not Armstrong' }}
        </div>
        <div class="text-caption text-medium-emphasis text-center mt-2">
          {{ digits.join(' + ') }}<sup>{{ digits.length }}</sup> = <strong>{{ sum }}</strong>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(153)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 0) return 'Enter a non-negative integer'
  if (v > 1_000_000_000) return 'Max is 1,000,000,000'
  return ''
})

const digits = computed<number[]>(() => {
  if (error.value) return []
  return String(Number(n.value)).split('').map(Number)
})

const sum = computed(() => {
  const p = digits.value.length
  return digits.value.reduce((s, d) => s + Math.pow(d, p), 0)
})

const isArmstrong = computed(() => !error.value && sum.value === Number(n.value))
</script>

<style scoped>
.an-badge {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.an-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.an-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}
</style>
