<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Luhn checksum validator"
        size="large"
      >
        <v-icon size="22">mdi-credit-card-check-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Luhn Checksum</div>
      <v-text-field
        v-model="input"
        label="Digits (spaces/dashes ok)"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="digits.length === 0" class="text-caption text-medium-emphasis text-center mt-2">Enter digits</div>
      <template v-else>
        <div class="lu-badge" :class="valid ? 'lu-badge--yes' : 'lu-badge--no'">
          {{ valid ? 'VALID ✓' : 'INVALID ✗' }}
        </div>
        <div class="lu-row">
          <div class="lu-col">
            <div class="lu-label">Digits</div>
            <div class="lu-val">{{ digits.length }}</div>
          </div>
          <div class="lu-col">
            <div class="lu-label">Check</div>
            <div class="lu-val">{{ checkDigit }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('4539 1488 0343 6467')

const digits = computed(() => (input.value || '').replace(/\D+/g, ''))

const valid = computed(() => {
  const d = digits.value
  if (d.length < 2) return false
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
})

const checkDigit = computed(() => {
  const d = digits.value
  if (d.length < 2) return '—'
  const body = d.slice(0, -1)
  let sum = 0
  let alt = true
  for (let i = body.length - 1; i >= 0; i--) {
    let n = body.charCodeAt(i) - 48
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return String((10 - (sum % 10)) % 10)
})
</script>

<style scoped>
.lu-badge {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.06em;
}

.lu-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.lu-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}

.lu-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.lu-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.lu-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.lu-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
