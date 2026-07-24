<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Quadratic equation solver"
        size="large"
      >
        <v-icon size="22">mdi-math-integral</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-1 text-center">Quadratic solver</div>
      <div class="text-caption text-medium-emphasis mb-2 text-center">
        ax² + bx + c = 0
      </div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="a" type="number" label="a" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="b" type="number" label="b" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="c" type="number" label="c" density="compact" variant="outlined" hide-details />
      </div>
      <div class="qs-out">
        <div v-if="result.kind === 'error'" class="text-caption text-error text-center">{{ result.msg }}</div>
        <template v-else-if="result.kind === 'linear'">
          <div class="text-caption text-medium-emphasis mb-1">Linear (a=0):</div>
          <div class="qs-root">x = {{ result.root }}</div>
        </template>
        <template v-else-if="result.kind === 'real'">
          <div class="text-caption text-medium-emphasis mb-1">Two real roots:</div>
          <div class="qs-root">x₁ = {{ result.r1 }}</div>
          <div class="qs-root">x₂ = {{ result.r2 }}</div>
        </template>
        <template v-else-if="result.kind === 'double'">
          <div class="text-caption text-medium-emphasis mb-1">Double root:</div>
          <div class="qs-root">x = {{ result.r }}</div>
        </template>
        <template v-else-if="result.kind === 'complex'">
          <div class="text-caption text-medium-emphasis mb-1">Complex roots:</div>
          <div class="qs-root">x₁ = {{ result.re }} + {{ result.im }}i</div>
          <div class="qs-root">x₂ = {{ result.re }} − {{ result.im }}i</div>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(1)
const b = ref<number>(-3)
const c = ref<number>(2)

type Result =
  | { kind: 'error'; msg: string }
  | { kind: 'linear'; root: string }
  | { kind: 'real'; r1: string; r2: string }
  | { kind: 'double'; r: string }
  | { kind: 'complex'; re: string; im: string }

function fmt(n: number): string {
  return (Math.round(n * 10000) / 10000).toString()
}

const result = computed<Result>(() => {
  const A = Number(a.value), B = Number(b.value), C = Number(c.value)
  if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(C)) {
    return { kind: 'error', msg: 'Enter numeric values' }
  }
  if (A === 0) {
    if (B === 0) {
      return C === 0
        ? { kind: 'error', msg: 'Infinite solutions (0 = 0)' }
        : { kind: 'error', msg: 'No solution' }
    }
    return { kind: 'linear', root: fmt(-C / B) }
  }
  const disc = B * B - 4 * A * C
  if (disc > 0) {
    const s = Math.sqrt(disc)
    return { kind: 'real', r1: fmt((-B + s) / (2 * A)), r2: fmt((-B - s) / (2 * A)) }
  }
  if (disc === 0) return { kind: 'double', r: fmt(-B / (2 * A)) }
  const s = Math.sqrt(-disc)
  return { kind: 'complex', re: fmt(-B / (2 * A)), im: fmt(s / (2 * A)) }
})
</script>

<style scoped>
.gap-8 { gap: 8px; }

.qs-out {
  min-height: 60px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.qs-root {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 13px;
}
</style>
