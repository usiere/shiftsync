<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="IPv4 converter"
        size="large"
      >
        <v-icon size="22">mdi-ip-network</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">IPv4 Converter</div>
      <v-text-field
        v-model="input"
        label="Dotted-quad IPv4"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ip-row">
          <div class="ip-label">Decimal</div>
          <div class="ip-val">{{ decimal }}</div>
        </div>
        <div class="ip-row">
          <div class="ip-label">Hex</div>
          <div class="ip-val">0x{{ hex }}</div>
        </div>
        <div class="ip-row">
          <div class="ip-label">Binary</div>
          <div class="ip-val ip-bin">{{ binary }}</div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('192.168.1.42')

const octets = computed(() => {
  const parts = (input.value || '').trim().split('.')
  if (parts.length !== 4) return null
  const nums = parts.map(p => Number(p))
  if (nums.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return nums
})

const error = computed(() => (octets.value ? '' : 'Enter A.B.C.D with each 0-255'))

const asInt = computed(() => {
  const o = octets.value!
  return (o[0] * 2 ** 24 + o[1] * 2 ** 16 + o[2] * 2 ** 8 + o[3]) >>> 0
})

const decimal = computed(() => asInt.value.toString())
const hex = computed(() => asInt.value.toString(16).toUpperCase().padStart(8, '0'))
const binary = computed(() => octets.value!.map(o => o.toString(2).padStart(8, '0')).join('.'))
</script>

<style scoped>
.ip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.ip-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
}

.ip-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.ip-bin {
  font-size: 11px;
}
</style>
