<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="ISBN validator"
        size="large"
      >
        <v-icon size="22">mdi-book-check-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">ISBN Validator</div>
      <v-text-field
        v-model="input"
        label="ISBN-10 or ISBN-13"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="!cleaned" class="text-caption text-medium-emphasis text-center mt-2">Enter an ISBN</div>
      <template v-else>
        <div class="is-badge" :class="valid ? 'is-badge--yes' : 'is-badge--no'">
          {{ valid ? `VALID ${format}` : 'INVALID' }}
        </div>
        <div class="is-note" v-if="!valid && cleaned.length !== 10 && cleaned.length !== 13">
          Length {{ cleaned.length }} — must be 10 or 13
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('978-0-306-40615-7')

const cleaned = computed(() => (input.value || '').replace(/[\s-]/g, '').toUpperCase())

function isValid10(s: string): boolean {
  if (!/^\d{9}[\dX]$/.test(s)) return false
  let sum = 0
  for (let i = 0; i < 10; i++) {
    const c = s.charAt(i)
    const n = c === 'X' ? 10 : c.charCodeAt(0) - 48
    sum += n * (10 - i)
  }
  return sum % 11 === 0
}

function isValid13(s: string): boolean {
  if (!/^\d{13}$/.test(s)) return false
  let sum = 0
  for (let i = 0; i < 13; i++) {
    const n = s.charCodeAt(i) - 48
    sum += n * (i % 2 === 0 ? 1 : 3)
  }
  return sum % 10 === 0
}

const valid = computed(() => {
  const s = cleaned.value
  return s.length === 10 ? isValid10(s) : s.length === 13 ? isValid13(s) : false
})

const format = computed(() => (cleaned.value.length === 10 ? 'ISBN-10' : 'ISBN-13'))
</script>

<style scoped>
.is-badge {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.06em;
}

.is-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.is-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}

.is-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
