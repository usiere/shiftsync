<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Right triangle solver"
        size="large"
      >
        <v-icon size="22">mdi-triangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Right Triangle</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="a" type="number" label="Leg a" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="b" type="number" label="Leg b" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rt-row">
          <div class="rt-col">
            <div class="rt-label">Hypotenuse</div>
            <div class="rt-val">{{ c }}</div>
          </div>
          <div class="rt-col">
            <div class="rt-label">Area</div>
            <div class="rt-val">{{ area }}</div>
          </div>
        </div>
        <div class="rt-row">
          <div class="rt-col">
            <div class="rt-label">∠A</div>
            <div class="rt-val">{{ angleA }}°</div>
          </div>
          <div class="rt-col">
            <div class="rt-label">∠B</div>
            <div class="rt-val">{{ angleB }}°</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(3)
const b = ref<number>(4)

const error = computed(() => {
  const av = Number(a.value)
  const bv = Number(b.value)
  if (!Number.isFinite(av) || !Number.isFinite(bv)) return 'Enter numbers'
  if (av <= 0 || bv <= 0) return 'Legs must be > 0'
  return ''
})

const c = computed(() => round(Math.hypot(Number(a.value), Number(b.value))))
const area = computed(() => round(0.5 * Number(a.value) * Number(b.value)))
const angleA = computed(() => round((Math.atan2(Number(a.value), Number(b.value)) * 180) / Math.PI))
const angleB = computed(() => round(90 - angleA.value))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.rt-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rt-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.rt-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.rt-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
