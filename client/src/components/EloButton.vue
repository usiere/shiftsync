<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Chess ELO change"
        size="large"
      >
        <v-icon size="22">mdi-chess-king</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">ELO Change</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="ra" type="number" label="Your ELO" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="rb" type="number" label="Opponent" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="k" type="number" label="K-factor" density="compact" variant="outlined" hide-details min="1" />
        <v-select
          v-model.number="score"
          :items="scores"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          label="Result"
        />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="el-badge" :class="delta >= 0 ? 'el-badge--up' : 'el-badge--dn'">
          {{ delta > 0 ? '+' : '' }}{{ delta }} pts
        </div>
        <div class="el-row">
          <div class="el-col">
            <div class="el-label">Expected</div>
            <div class="el-val">{{ expected }}</div>
          </div>
          <div class="el-col">
            <div class="el-label">New rating</div>
            <div class="el-val">{{ newRating }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const ra = ref<number>(1500)
const rb = ref<number>(1600)
const k = ref<number>(32)
const score = ref<number>(1)

const scores = [
  { label: 'Win (1)', value: 1 },
  { label: 'Draw (½)', value: 0.5 },
  { label: 'Loss (0)', value: 0 },
]

const error = computed(() => {
  const vals = [ra.value, rb.value, k.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (Number(k.value) <= 0) return 'K-factor must be > 0'
  return ''
})

const expectedRaw = computed(() => 1 / (1 + Math.pow(10, (Number(rb.value) - Number(ra.value)) / 400)))
const expected = computed(() => Math.round(expectedRaw.value * 1000) / 1000)
const delta = computed(() => Math.round(Number(k.value) * (Number(score.value) - expectedRaw.value)))
const newRating = computed(() => Math.round(Number(ra.value)) + delta.value)
</script>

<style scoped>
.el-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
}

.el-badge--up {
  background: #DCFCE7;
  color: #166534;
}

.el-badge--dn {
  background: #FEE2E2;
  color: #991B1B;
}

.el-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.el-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.el-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.el-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
