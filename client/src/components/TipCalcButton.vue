<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Tip calculator"
        size="large"
      >
        <v-icon size="22">mdi-cash-multiple</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <v-text-field
        v-model.number="bill"
        type="number"
        label="Bill"
        density="compact"
        variant="outlined"
        hide-details
        prefix="$"
        step="0.01"
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <span class="text-caption text-medium-emphasis" style="width: 40px">Tip %</span>
        <v-slider
          v-model="tipPct"
          :min="0"
          :max="30"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="text-caption" style="width: 32px; text-align: right">{{ tipPct }}%</span>
      </div>
      <v-text-field
        v-model.number="people"
        type="number"
        label="Split by (people)"
        density="compact"
        variant="outlined"
        hide-details
        min="1"
        class="mb-3"
      />

      <div class="tip-grid">
        <div class="tip-cell">
          <div class="tip-label">Tip</div>
          <div class="tip-value">{{ fmt(tip) }}</div>
        </div>
        <div class="tip-cell">
          <div class="tip-label">Total</div>
          <div class="tip-value">{{ fmt(total) }}</div>
        </div>
        <div class="tip-cell">
          <div class="tip-label">Per person</div>
          <div class="tip-value">{{ fmt(perPerson) }}</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const bill = ref(50)
const tipPct = ref(18)
const people = ref(1)

const safeBill = computed(() => (Number.isFinite(bill.value) ? bill.value : 0))
const safePeople = computed(() => (Number.isFinite(people.value) && people.value > 0 ? people.value : 1))

const tip = computed(() => safeBill.value * (tipPct.value / 100))
const total = computed(() => safeBill.value + tip.value)
const perPerson = computed(() => total.value / safePeople.value)

function fmt(v: number): string {
  return v.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
.tip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.tip-cell {
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.tip-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
}

.tip-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
}

.gap-8 {
  gap: 8px;
}
</style>
