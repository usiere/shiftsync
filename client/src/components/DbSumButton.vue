<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Sum sound levels (dB)"
        size="large"
      >
        <v-icon size="22">mdi-volume-vibrate</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Sum Sound Levels</div>
      <v-textarea
        v-model="input"
        label="One dB value per line"
        density="compact"
        variant="outlined"
        hide-details
        rows="4"
        auto-grow
      />
      <div v-if="values.length === 0" class="text-caption text-medium-emphasis text-center mt-2">Enter numbers</div>
      <template v-else>
        <div class="db-badge">{{ total }} dB</div>
        <div class="db-row">
          <div class="db-col">
            <div class="db-label">Sources</div>
            <div class="db-val">{{ values.length }}</div>
          </div>
          <div class="db-col">
            <div class="db-label">Loudest</div>
            <div class="db-val">{{ loudest }} dB</div>
          </div>
        </div>
        <div class="db-note">Uses power sum: 10·log₁₀ Σ 10^(Li / 10)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('70\n72\n68')

const values = computed(() => {
  return (input.value || '').split(/[\s,]+/).map(Number).filter(v => Number.isFinite(v))
})

const total = computed(() => {
  if (values.value.length === 0) return 0
  const sum = values.value.reduce((s, v) => s + Math.pow(10, v / 10), 0)
  return Math.round(10 * Math.log10(sum) * 10) / 10
})

const loudest = computed(() => (values.value.length === 0 ? 0 : Math.max(...values.value)))
</script>

<style scoped>
.db-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 22px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.db-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.db-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.db-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.db-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.db-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
