<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="CIDR subnet"
        size="large"
      >
        <v-icon size="22">mdi-lan</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">CIDR Subnet</div>
      <v-text-field
        v-model.number="prefix"
        type="number"
        label="Prefix length (0-32)"
        density="compact"
        variant="outlined"
        hide-details
        min="0"
        max="32"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="cd-row">
          <div class="cd-label">Netmask</div>
          <div class="cd-val">{{ netmask }}</div>
        </div>
        <div class="cd-row">
          <div class="cd-label">Wildcard</div>
          <div class="cd-val">{{ wildcard }}</div>
        </div>
        <div class="cd-row">
          <div class="cd-label">Total addresses</div>
          <div class="cd-val">{{ total }}</div>
        </div>
        <div class="cd-row">
          <div class="cd-label">Usable hosts</div>
          <div class="cd-val">{{ usable }}</div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const prefix = ref<number>(24)

const error = computed(() => {
  const p = Number(prefix.value)
  if (!Number.isInteger(p) || p < 0 || p > 32) return 'Prefix must be 0-32'
  return ''
})

function toDotted(n: number) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.')
}

const maskInt = computed(() => (prefix.value === 0 ? 0 : (~0 << (32 - Number(prefix.value))) >>> 0))
const netmask = computed(() => toDotted(maskInt.value))
const wildcard = computed(() => toDotted((~maskInt.value) >>> 0))
const total = computed(() => Math.pow(2, 32 - Number(prefix.value)).toLocaleString())
const usable = computed(() => {
  const t = Math.pow(2, 32 - Number(prefix.value))
  const u = t <= 2 ? Math.max(0, t - 0) : t - 2
  return u.toLocaleString()
})
</script>

<style scoped>
.cd-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.cd-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
}

.cd-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
