<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Digital root"
        size="large"
      >
        <v-icon size="22">mdi-alpha-r-circle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Digital Root</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Non-negative integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="dr-root">Root: <strong>{{ trace[trace.length - 1] }}</strong></div>
        <div class="dr-trace">
          <span v-for="(v, i) in trace" :key="i">
            <span class="dr-pill">{{ v }}</span>
            <span v-if="i < trace.length - 1" class="dr-arrow">→</span>
          </span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(9875)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 0) return 'Enter a non-negative integer'
  if (v > Number.MAX_SAFE_INTEGER) return 'Too large'
  return ''
})

const trace = computed<number[]>(() => {
  if (error.value) return []
  const out: number[] = []
  let cur = Number(n.value)
  out.push(cur)
  while (cur >= 10) {
    cur = String(cur).split('').reduce((s, d) => s + Number(d), 0)
    out.push(cur)
  }
  return out
})
</script>

<style scoped>
.dr-root {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  background: #E0F2FE;
  color: #075985;
}

.dr-trace {
  margin-top: 8px;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.dr-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}

.dr-arrow {
  margin: 0 4px;
  color: #94A3B8;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
}
</style>
