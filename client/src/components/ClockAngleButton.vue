<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Angle between clock hands"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-four-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Clock Hand Angle</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="h" type="number" label="Hour (0-23)" density="compact" variant="outlined" hide-details min="0" max="23" />
        <v-text-field v-model.number="m" type="number" label="Minute (0-59)" density="compact" variant="outlined" hide-details min="0" max="59" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ca-badge">{{ angle }}°</div>
        <div class="ca-row">
          <div class="ca-col">
            <div class="ca-label">Hour hand</div>
            <div class="ca-val">{{ hourAngle }}°</div>
          </div>
          <div class="ca-col">
            <div class="ca-label">Minute hand</div>
            <div class="ca-val">{{ minAngle }}°</div>
          </div>
        </div>
        <div class="ca-note">Reflex: {{ round(360 - Number(angle)) }}°</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const h = ref<number>(3)
const m = ref<number>(15)

const error = computed(() => {
  const hv = Number(h.value)
  const mv = Number(m.value)
  if (!Number.isInteger(hv) || hv < 0 || hv > 23) return 'Hour must be 0-23'
  if (!Number.isInteger(mv) || mv < 0 || mv > 59) return 'Minute must be 0-59'
  return ''
})

const hourAngle = computed(() => round(((Number(h.value) % 12) * 60 + Number(m.value)) * 0.5))
const minAngle = computed(() => round(Number(m.value) * 6))
const angle = computed(() => {
  const diff = Math.abs(hourAngle.value - minAngle.value)
  return round(Math.min(diff, 360 - diff))
})

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.ca-badge {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  background: #FEF3C7;
  color: #78350F;
}

.ca-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.ca-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.ca-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.ca-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.ca-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
