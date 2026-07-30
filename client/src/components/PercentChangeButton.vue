<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Percent change (old → new)"
        size="large"
      >
        <v-icon size="22">mdi-trending-up</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Percent change</div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="oldVal" type="number" label="Old" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="newVal" type="number" label="New" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="pc-big" :class="direction">
          <v-icon size="20" class="me-1">{{ icon }}</v-icon>
          {{ percentLabel }}
        </div>
        <div class="pc-row"><span>Absolute Δ</span><span class="pc-value">{{ delta }}</span></div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const oldVal = ref<number>(80)
const newVal = ref<number>(100)

const error = computed(() => {
  if (!Number.isFinite(Number(oldVal.value)) || !Number.isFinite(Number(newVal.value))) return 'Enter two numbers'
  if (Number(oldVal.value) === 0) return 'Old value cannot be 0'
  return ''
})

const rawChange = computed(() => Number(newVal.value) - Number(oldVal.value))
const percent = computed(() => (rawChange.value / Number(oldVal.value)) * 100)

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString()
}

const percentLabel = computed(() => `${percent.value >= 0 ? '+' : ''}${fmt(percent.value)}%`)
const delta = computed(() => `${rawChange.value >= 0 ? '+' : ''}${fmt(rawChange.value)}`)

const direction = computed(() => (percent.value > 0 ? 'pc-up' : percent.value < 0 ? 'pc-down' : 'pc-flat'))
const icon = computed(() => (percent.value > 0 ? 'mdi-arrow-up-bold' : percent.value < 0 ? 'mdi-arrow-down-bold' : 'mdi-minus'))
</script>

<style scoped>
.gap-8 { gap: 8px; }

.pc-big {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 8px;
}

.pc-up { background: #DCFCE7; color: #166534; }
.pc-down { background: #FEE2E2; color: #991B1B; }
.pc-flat { background: rgba(148, 163, 184, 0.12); color: #64748B; }

.pc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-size: 12px;
}

.pc-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
