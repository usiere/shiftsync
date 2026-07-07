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
        title="Quick calculator"
        size="large"
      >
        <v-icon size="22">mdi-calculator</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-caption text-medium-emphasis mb-2">
        Type a math expression (e.g. <code>25 * 8 + 40</code>)
      </div>
      <v-text-field
        v-model="expr"
        placeholder="Expression"
        density="compact"
        variant="outlined"
        hide-details
        autofocus
        @keydown.enter.prevent="onEnter"
      />
      <div class="d-flex align-center mt-3">
        <div class="calc-result text-body-1 flex-grow-1">
          <span v-if="error" class="text-error">Error</span>
          <span v-else-if="result !== null">= {{ formatted }}</span>
          <span v-else class="text-medium-emphasis">Enter an expression</span>
        </div>
        <v-btn
          size="small"
          variant="text"
          :disabled="result === null"
          @click="copy"
        >
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const expr = ref('')
const result = ref<number | null>(null)
const error = ref(false)
const notify = useNotificationStore()

const SAFE = /^[\s0-9+\-*/().%eE]*$/

function evaluate(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (!SAFE.test(trimmed)) throw new Error('unsafe')
  const fn = new Function(`"use strict"; return (${trimmed});`)
  const value = fn()
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('nan')
  return value
}

watch(expr, (v) => {
  try {
    result.value = evaluate(v)
    error.value = false
  } catch {
    result.value = null
    error.value = v.trim().length > 0
  }
})

watch(open, (v) => {
  if (!v) {
    expr.value = ''
    result.value = null
    error.value = false
  }
})

const formatted = computed(() => {
  if (result.value === null) return ''
  const n = result.value
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
})

async function copy() {
  if (result.value === null) return
  try {
    await navigator.clipboard.writeText(String(result.value))
    notify.showToast({
      type: 'success',
      title: 'Result copied',
      message: `${expr.value} = ${formatted.value}`,
    })
  } catch {
    /* ignore */
  }
}

function onEnter() {
  if (result.value !== null) copy()
}
</script>

<style scoped>
.calc-result {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

code {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  background: rgba(148, 163, 184, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
