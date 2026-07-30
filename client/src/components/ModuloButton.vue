<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Modulo calculator"
        size="large"
      >
        <v-icon size="22">mdi-percent-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Modulo</div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="a" type="number" label="a" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="b" type="number" label="b" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="mo-row"><span>a % b (JS)</span><span class="mo-value">{{ jsMod }}</span></div>
        <div class="mo-row"><span>a mod b (math)</span><span class="mo-value">{{ trueMod }}</span></div>
        <div class="mo-row"><span>quotient</span><span class="mo-value">{{ quotient }}</span></div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(17)
const b = ref<number>(5)

const error = computed(() => {
  if (!Number.isFinite(Number(a.value)) || !Number.isFinite(Number(b.value))) return 'Enter two numbers'
  if (Number(b.value) === 0) return 'b cannot be 0'
  return ''
})

const jsMod = computed(() => Number(a.value) % Number(b.value))
const trueMod = computed(() => ((Number(a.value) % Number(b.value)) + Number(b.value)) % Number(b.value))
const quotient = computed(() => Math.floor(Number(a.value) / Number(b.value)))
</script>

<style scoped>
.gap-8 { gap: 8px; }

.mo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
  font-size: 12px;
}

.mo-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
