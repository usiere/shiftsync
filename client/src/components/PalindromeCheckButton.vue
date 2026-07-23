<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Palindrome checker"
        size="large"
      >
        <v-icon size="22">mdi-mirror</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Palindrome checker</div>
      <v-text-field
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        placeholder="Was it a car or a cat I saw?"
      />
      <div class="pc-result" :class="verdict.klass">
        <v-icon size="16" class="me-1">{{ verdict.icon }}</v-icon>
        {{ verdict.label }}
      </div>
      <div v-if="normalized" class="pc-norm mt-2">
        <span class="text-caption text-medium-emphasis">Normalized:</span>
        <div class="pc-mono">{{ normalized }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')

const normalized = computed(() =>
  text.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
)

const verdict = computed(() => {
  if (!text.value.trim()) {
    return { label: 'Type something', icon: 'mdi-help-circle-outline', klass: 'pc-idle' }
  }
  const n = normalized.value
  if (n.length < 2) {
    return { label: 'Too short', icon: 'mdi-alert-circle-outline', klass: 'pc-idle' }
  }
  const isPal = n === n.split('').reverse().join('')
  return isPal
    ? { label: 'Palindrome!', icon: 'mdi-check-circle', klass: 'pc-yes' }
    : { label: 'Not a palindrome', icon: 'mdi-close-circle', klass: 'pc-no' }
})
</script>

<style scoped>
.pc-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.pc-idle {
  background: rgba(148, 163, 184, 0.12);
  color: #64748B;
}

.pc-yes {
  background: #DCFCE7;
  color: #166534;
}

.pc-no {
  background: #FEE2E2;
  color: #991B1B;
}

.pc-mono {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  margin-top: 2px;
  word-break: break-all;
}
</style>
