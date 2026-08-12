<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="VO2 max (Cooper test)"
        size="large"
      >
        <v-icon size="22">mdi-lungs</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">VO2 max (Cooper)</div>
      <v-text-field v-model.number="meters" type="number" label="12-min distance (m)" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <v-select
        v-model="cohort"
        :items="cohorts"
        density="compact"
        variant="outlined"
        hide-details
        label="Cohort"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="vo-badge" :style="{ background: rating.bg, color: rating.fg }">
          {{ vo2 }} ml/kg/min
        </div>
        <div class="vo-note">{{ rating.label }}</div>
        <div class="vo-note">VO2 = (m − 504.9) / 44.73</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const meters = ref<number>(2400)
const cohort = ref<string>('M 30-39')

const cohorts = ['M 20-29', 'M 30-39', 'M 40-49', 'M 50+', 'F 20-29', 'F 30-39', 'F 40-49', 'F 50+']

const error = computed(() => {
  const m = Number(meters.value)
  if (!Number.isFinite(m) || m < 0) return 'Distance must be ≥ 0'
  if (m > 6000) return 'Sanity max 6000 m'
  return ''
})

const vo2 = computed(() => round(Math.max(0, (Number(meters.value) - 504.9) / 44.73)))

const rating = computed(() => {
  const v = vo2.value
  const isMale = cohort.value.startsWith('M')
  const thresholds = isMale
    ? { poor: 32, fair: 39, good: 46, excellent: 53 }
    : { poor: 27, fair: 33, good: 39, excellent: 46 }
  if (v < thresholds.poor)      return { label: 'Very poor',   bg: '#FEE2E2', fg: '#991B1B' }
  if (v < thresholds.fair)      return { label: 'Poor',        bg: '#FFEDD5', fg: '#7C2D12' }
  if (v < thresholds.good)      return { label: 'Fair',        bg: '#FEF3C7', fg: '#78350F' }
  if (v < thresholds.excellent) return { label: 'Good',        bg: '#ECFCCB', fg: '#365314' }
  return { label: 'Excellent', bg: '#DCFCE7', fg: '#166534' }
})

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.vo-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
}

.vo-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
