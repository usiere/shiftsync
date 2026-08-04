<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Ellipse area &amp; circumference"
        size="large"
      >
        <v-icon size="22">mdi-ellipse-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Ellipse</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="a" type="number" label="Semi-major a" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="b" type="number" label="Semi-minor b" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="el-row">
          <div class="el-col">
            <div class="el-label">Area</div>
            <div class="el-val">{{ area }}</div>
          </div>
          <div class="el-col">
            <div class="el-label">Circumference</div>
            <div class="el-val">{{ circ }}</div>
          </div>
        </div>
        <div class="el-note">Circumference via Ramanujan approx.</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(5)
const b = ref<number>(3)

const error = computed(() => {
  const av = Number(a.value)
  const bv = Number(b.value)
  if (!Number.isFinite(av) || !Number.isFinite(bv)) return 'Enter numbers'
  if (av < 0 || bv < 0) return 'Values must be ≥ 0'
  return ''
})

const area = computed(() => round(Math.PI * Number(a.value) * Number(b.value)))

const circ = computed(() => {
  const av = Number(a.value)
  const bv = Number(b.value)
  const h = ((av - bv) ** 2) / ((av + bv) ** 2)
  const c = Math.PI * (av + bv) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
  return round(c)
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.el-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.el-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
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

.el-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
}
</style>
