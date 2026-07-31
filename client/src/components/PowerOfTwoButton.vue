<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Nearest power of two"
        size="large"
      >
        <v-icon size="22">mdi-numeric-2-box-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Power of 2</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="p2-badge" :class="isPow2 ? 'p2-badge--yes' : 'p2-badge--no'">
          {{ isPow2 ? `Exact — 2^${exact}` : 'Not a power of 2' }}
        </div>
        <div class="p2-row">
          <div class="p2-col">
            <div class="p2-label">Prev</div>
            <div class="p2-val">2<sup>{{ prevExp }}</sup> = {{ prevVal }}</div>
          </div>
          <div class="p2-col">
            <div class="p2-label">Next</div>
            <div class="p2-val">2<sup>{{ nextExp }}</sup> = {{ nextVal }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(100)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter a positive integer'
  if (v > 1_000_000_000) return 'Max is 1,000,000,000'
  return ''
})

const isPow2 = computed(() => {
  if (error.value) return false
  const v = Number(n.value)
  return (v & (v - 1)) === 0
})

const exact = computed(() => Math.log2(Number(n.value)))

const prevExp = computed(() => Math.floor(Math.log2(Number(n.value))))
const nextExp = computed(() => isPow2.value ? prevExp.value : prevExp.value + 1)
const prevVal = computed(() => 2 ** prevExp.value)
const nextVal = computed(() => 2 ** nextExp.value)
</script>

<style scoped>
.p2-badge {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.p2-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.p2-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}

.p2-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.p2-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.p2-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.p2-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
