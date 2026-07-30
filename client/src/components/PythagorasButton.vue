<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Pythagoras calculator"
        size="large"
      >
        <v-icon size="22">mdi-triangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-1 text-center">Pythagoras</div>
      <div class="text-caption text-medium-emphasis mb-2 text-center">a² + b² = c²</div>
      <v-select
        v-model="solveFor"
        :items="[
          { title: 'Solve for c (hypotenuse)', value: 'c' },
          { title: 'Solve for a (leg)', value: 'a' },
          { title: 'Solve for b (leg)', value: 'b' },
        ]"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-text-field v-if="solveFor !== 'a'" v-model.number="a" type="number" label="a" density="compact" variant="outlined" hide-details class="mb-2" />
      <v-text-field v-if="solveFor !== 'b'" v-model.number="b" type="number" label="b" density="compact" variant="outlined" hide-details class="mb-2" />
      <v-text-field v-if="solveFor !== 'c'" v-model.number="c" type="number" label="c" density="compact" variant="outlined" hide-details class="mb-2" />
      <div class="py-row"><span>{{ solveFor }}</span><span class="py-value">{{ result }}</span></div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const solveFor = ref<'a' | 'b' | 'c'>('c')
const a = ref<number>(3)
const b = ref<number>(4)
const c = ref<number>(5)

const result = computed(() => {
  const A = Number(a.value), B = Number(b.value), C = Number(c.value)
  let v = 0
  if (solveFor.value === 'c') v = Math.sqrt(A * A + B * B)
  else if (solveFor.value === 'a') v = Math.sqrt(C * C - B * B)
  else v = Math.sqrt(C * C - A * A)
  if (!Number.isFinite(v)) return 'invalid'
  return (Math.round(v * 10000) / 10000).toString()
})
</script>

<style scoped>
.py-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-size: 12px;
}

.py-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
