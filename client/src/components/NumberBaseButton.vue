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
        title="Number base converter"
        size="large"
      >
        <v-icon size="22">mdi-numeric</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-caption text-medium-emphasis mb-2">
        Enter a value in any field to convert
      </div>
      <div class="base-grid">
        <div v-for="b in bases" :key="b.name" class="base-row">
          <span class="base-label">{{ b.name }}</span>
          <v-text-field
            v-model="values[b.name]"
            density="compact"
            variant="outlined"
            hide-details
            :placeholder="b.placeholder"
            @update:model-value="onChange(b.radix, $event)"
          />
        </div>
      </div>
      <div v-if="error" class="text-error text-caption mt-2">{{ error }}</div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Base {
  name: 'DEC' | 'HEX' | 'OCT' | 'BIN'
  radix: number
  placeholder: string
}

const open = ref(false)
const error = ref('')

const bases: Base[] = [
  { name: 'DEC', radix: 10, placeholder: '255' },
  { name: 'HEX', radix: 16, placeholder: 'ff' },
  { name: 'OCT', radix: 8, placeholder: '377' },
  { name: 'BIN', radix: 2, placeholder: '11111111' },
]

const values = reactive<Record<Base['name'], string>>({
  DEC: '',
  HEX: '',
  OCT: '',
  BIN: '',
})

function nameForRadix(radix: number): Base['name'] {
  return bases.find((b) => b.radix === radix)!.name
}

function onChange(radix: number, raw: string) {
  error.value = ''
  const trimmed = raw.trim().replace(/^0[xX]/, '')
  const from = nameForRadix(radix)
  values[from] = raw
  if (!trimmed) {
    for (const b of bases) if (b.name !== from) values[b.name] = ''
    return
  }
  const n = parseInt(trimmed, radix)
  if (!Number.isFinite(n) || Number.isNaN(n) || !new RegExp(radixPattern(radix)).test(trimmed)) {
    error.value = `Invalid ${from} value`
    for (const b of bases) if (b.name !== from) values[b.name] = ''
    return
  }
  for (const b of bases) {
    if (b.name === from) continue
    values[b.name] = n.toString(b.radix)
  }
}

function radixPattern(radix: number): string {
  if (radix === 2) return '^[01]+$'
  if (radix === 8) return '^[0-7]+$'
  if (radix === 16) return '^[0-9a-fA-F]+$'
  return '^[0-9]+$'
}
</script>

<style scoped>
.base-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.base-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-label {
  width: 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.05em;
}

.base-row :deep(input) {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}
</style>
