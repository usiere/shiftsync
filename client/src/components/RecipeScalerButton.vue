<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Recipe scaler"
        size="large"
      >
        <v-icon size="22">mdi-chef-hat</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Recipe Scaler</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="fromServ" type="number" label="Original" density="compact" variant="outlined" hide-details min="1" />
        <v-text-field v-model.number="toServ" type="number" label="Target" density="compact" variant="outlined" hide-details min="1" />
      </div>
      <v-textarea
        v-model="input"
        label="One ingredient per line (amount + unit + name)"
        density="compact"
        variant="outlined"
        hide-details
        rows="4"
        auto-grow
        class="mt-2"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rs-note">Scale ×{{ factor }}</div>
        <div v-for="(line, i) in scaled" :key="i" class="rs-line">{{ line }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const fromServ = ref<number>(4)
const toServ = ref<number>(6)
const input = ref<string>('2 cups flour\n1.5 tsp salt\n3 eggs\n250 g butter')

const error = computed(() => {
  const a = Number(fromServ.value)
  const b = Number(toServ.value)
  if (!Number.isInteger(a) || !Number.isInteger(b)) return 'Servings must be integers'
  if (a < 1 || b < 1) return 'Servings must be ≥ 1'
  return ''
})

const factor = computed(() => Math.round((Number(toServ.value) / Number(fromServ.value)) * 100) / 100)

const scaled = computed(() => {
  return (input.value || '').split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const m = line.match(/^([\d.\/]+)\s*(.*)$/)
      if (!m) return line
      const raw = m[1]
      const rest = m[2]
      let num = 0
      if (raw.includes('/')) {
        const [n, d] = raw.split('/').map(Number)
        num = n / d
      } else {
        num = parseFloat(raw)
      }
      if (!Number.isFinite(num)) return line
      const scaledNum = num * factor.value
      const pretty = scaledNum.toFixed(2).replace(/\.?0+$/, '')
      return `${pretty} ${rest}`
    })
})
</script>

<style scoped>
.rs-note {
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 12px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.rs-line {
  margin-top: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #0F172A;
}
</style>
