<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Rule of 72 doubling time"
        size="large"
      >
        <v-icon size="22">mdi-cash-refund</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Rule of 72</div>
      <v-text-field
        v-model.number="rate"
        type="number"
        label="Annual rate (%)"
        density="compact"
        variant="outlined"
        hide-details
        min="0.01"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="r72-badge">~{{ years }} yrs to 2×</div>
        <div class="r72-row">
          <div class="r72-col">
            <div class="r72-label">Exact (ln 2)</div>
            <div class="r72-val">{{ exact }} yrs</div>
          </div>
          <div class="r72-col">
            <div class="r72-label">4× time</div>
            <div class="r72-val">{{ quad }} yrs</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const rate = ref<number>(6)

const error = computed(() => {
  const r = Number(rate.value)
  if (!Number.isFinite(r) || r <= 0) return 'Rate must be > 0'
  if (r > 1000) return 'Max 1000%'
  return ''
})

const years = computed(() => round(72 / Number(rate.value)))
const exact = computed(() => round(Math.log(2) / Math.log(1 + Number(rate.value) / 100)))
const quad = computed(() => round(2 * years.value))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.r72-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #ECFCCB;
  color: #365314;
}

.r72-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.r72-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.r72-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.r72-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
