<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Factorial calculator"
        size="large"
      >
        <v-icon size="22">mdi-exclamation-thick</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Factorial (n!)</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="n"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        max="500"
      />
      <div class="fc-result">
        <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
        <template v-else>
          <div class="text-caption text-medium-emphasis mb-1">{{ n }}! =</div>
          <div class="fc-value">{{ display }}</div>
          <div v-if="truncated" class="text-caption text-medium-emphasis mt-1">
            {{ digits }} digits total
          </div>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(10)

const result = computed<{ ok: true; value: bigint } | { ok: false; msg: string }>(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 0) return { ok: false, msg: 'Enter a non-negative integer' }
  if (v > 500) return { ok: false, msg: 'Max is 500' }
  let acc = 1n
  for (let i = 2; i <= v; i++) acc *= BigInt(i)
  return { ok: true, value: acc }
})

const error = computed(() => (result.value.ok ? '' : result.value.msg))
const display = computed(() => {
  if (!result.value.ok) return ''
  const s = result.value.value.toString()
  return s.length > 120 ? s.slice(0, 120) + '…' : s
})
const truncated = computed(
  () => result.value.ok && result.value.value.toString().length > 120,
)
const digits = computed(() =>
  result.value.ok ? result.value.value.toString().length : 0,
)
</script>

<style scoped>
.fc-result {
  min-height: 60px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.fc-value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  word-break: break-all;
  color: #1E40AF;
}
</style>
