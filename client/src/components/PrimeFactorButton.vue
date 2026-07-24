<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Prime factorization"
        size="large"
      >
        <v-icon size="22">mdi-format-list-numbered</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Prime factorization</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer (≥ 2)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="2"
      />
      <div class="pf-out">
        <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
        <template v-else>
          <div class="pf-expr">{{ n }} = {{ expression }}</div>
          <div class="text-caption text-medium-emphasis text-center mt-1">
            {{ factors.length }} prime factor{{ factors.length === 1 ? '' : 's' }}
          </div>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(360)

function factorize(x: number): number[] {
  const out: number[] = []
  let v = x
  while (v % 2 === 0) { out.push(2); v /= 2 }
  for (let i = 3; i * i <= v; i += 2) {
    while (v % i === 0) { out.push(i); v /= i }
  }
  if (v > 1) out.push(v)
  return out
}

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 2) return 'Enter an integer ≥ 2'
  if (v > 1e12) return 'Max is 1,000,000,000,000'
  return ''
})

const factors = computed<number[]>(() => (error.value ? [] : factorize(Number(n.value))))

const expression = computed(() => {
  if (!factors.value.length) return ''
  const groups = new Map<number, number>()
  for (const f of factors.value) groups.set(f, (groups.get(f) || 0) + 1)
  return Array.from(groups.entries())
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e}`))
    .join(' × ')
})
</script>

<style scoped>
.pf-out {
  min-height: 60px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.pf-expr {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 13px;
  word-break: break-all;
}
</style>
