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
        title="Number formatter"
        size="large"
      >
        <v-icon size="22">mdi-format-list-numbered</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-text-field
        v-model="input"
        type="number"
        label="Number"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />

      <div v-if="valid" class="fmt-list">
        <div v-for="row in rows" :key="row.label" class="fmt-row">
          <span class="fmt-label">{{ row.label }}</span>
          <code class="fmt-value">{{ row.value }}</code>
          <v-btn size="x-small" variant="text" @click="copy(row.value)">
            <v-icon size="14">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-else class="text-caption text-medium-emphasis">
        Enter a number to see it formatted.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const notify = useNotificationStore()

const parsed = computed(() => parseFloat(input.value))
const valid = computed(() => Number.isFinite(parsed.value))

const rows = computed(() => {
  const n = parsed.value
  return [
    { label: 'Comma', value: n.toLocaleString('en-US') },
    { label: 'Space', value: n.toLocaleString('fr-FR').replace(/\s/g, ' ') },
    { label: 'Underscore', value: String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_') },
    {
      label: 'Compact',
      value: new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n),
    },
    { label: 'Scientific', value: n.toExponential(4) },
    { label: 'Fixed (2)', value: n.toFixed(2) },
    {
      label: 'Percent',
      value: new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 2 }).format(n),
    },
    {
      label: 'Currency',
      value: n.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    },
  ]
})

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    notify.showToast({
      type: 'success',
      title: 'Value copied',
      message: value,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.fmt-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fmt-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fmt-label {
  width: 84px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fmt-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}
</style>
