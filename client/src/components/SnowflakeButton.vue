<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Snowflake ID decoder"
        size="large"
      >
        <v-icon size="22">mdi-snowflake</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Snowflake Decoder</div>
      <v-text-field
        v-model="input"
        label="Snowflake ID"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-select
        v-model="epoch"
        :items="epochs"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Epoch"
        class="mt-2"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sf-badge">{{ iso }}</div>
        <div class="sf-row">
          <div class="sf-col">
            <div class="sf-label">Worker</div>
            <div class="sf-val">{{ worker }}</div>
          </div>
          <div class="sf-col">
            <div class="sf-label">Process</div>
            <div class="sf-val">{{ process }}</div>
          </div>
          <div class="sf-col">
            <div class="sf-label">Sequence</div>
            <div class="sf-val">{{ sequence }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('1420070400000')
const epoch = ref<number>(1420070400000)

const epochs = [
  { label: 'Discord (2015)', value: 1420070400000 },
  { label: 'Twitter (2010)', value: 1288834974657 },
  { label: 'Unix (0)', value: 0 },
]

const parsed = computed(() => {
  try {
    const s = (input.value || '').trim()
    if (!/^\d+$/.test(s)) return null
    return BigInt(s)
  } catch {
    return null
  }
})

const error = computed(() => (parsed.value === null ? 'Enter a numeric ID' : ''))

const ms = computed(() => {
  const id = parsed.value!
  return Number((id >> 22n) + BigInt(epoch.value))
})

const worker = computed(() => Number((parsed.value! >> 17n) & 0x1fn))
const process = computed(() => Number((parsed.value! >> 12n) & 0x1fn))
const sequence = computed(() => Number(parsed.value! & 0xfffn))

const iso = computed(() => new Date(ms.value).toISOString())
</script>

<style scoped>
.sf-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  background: #E0E7FF;
  color: #3730A3;
  word-break: break-all;
}

.sf-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.sf-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.sf-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.sf-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
