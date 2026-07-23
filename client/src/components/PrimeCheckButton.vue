<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Prime number checker"
        size="large"
      >
        <v-icon size="22">mdi-numeric</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Prime checker</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Number"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
      />
      <div class="pk-result" :class="verdict.klass">
        <v-icon size="16" class="me-1">{{ verdict.icon }}</v-icon>
        {{ verdict.label }}
      </div>
      <div v-if="verdict.detail" class="text-caption text-medium-emphasis text-center mt-2">
        {{ verdict.detail }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(17)

function smallestFactor(x: number): number {
  if (x % 2 === 0) return 2
  const lim = Math.floor(Math.sqrt(x))
  for (let i = 3; i <= lim; i += 2) {
    if (x % i === 0) return i
  }
  return x
}

const verdict = computed(() => {
  const x = Number(n.value)
  if (!Number.isInteger(x) || x < 0) {
    return { label: 'Enter a non-negative integer', icon: 'mdi-alert-circle-outline', klass: 'pk-idle', detail: '' }
  }
  if (x < 2) {
    return { label: 'Not prime', icon: 'mdi-close-circle', klass: 'pk-no', detail: `${x} is not prime by definition` }
  }
  if (x > Number.MAX_SAFE_INTEGER) {
    return { label: 'Too large', icon: 'mdi-alert-circle-outline', klass: 'pk-idle', detail: '' }
  }
  const f = smallestFactor(x)
  return f === x
    ? { label: 'Prime!', icon: 'mdi-check-circle', klass: 'pk-yes', detail: `${x} has no divisors other than 1 and itself` }
    : { label: 'Composite', icon: 'mdi-close-circle', klass: 'pk-no', detail: `Divisible by ${f}` }
})
</script>

<style scoped>
.pk-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.pk-idle {
  background: rgba(148, 163, 184, 0.12);
  color: #64748B;
}

.pk-yes {
  background: #DCFCE7;
  color: #166534;
}

.pk-no {
  background: #FEE2E2;
  color: #991B1B;
}
</style>
