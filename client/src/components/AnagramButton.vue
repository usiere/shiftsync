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
        title="Anagram checker"
        size="large"
      >
        <v-icon size="22">mdi-shuffle-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-text-field
        v-model="a"
        label="First word/phrase"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-text-field
        v-model="b"
        label="Second word/phrase"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />

      <div class="anagram-result" :class="`anagram-result--${verdict.key}`">
        <v-icon size="24" class="me-2">{{ verdict.icon }}</v-icon>
        {{ verdict.label }}
      </div>

      <div class="d-flex align-center mt-2">
        <v-checkbox v-model="ignoreCase" density="compact" hide-details label="Ignore case" />
        <v-spacer />
        <v-checkbox v-model="ignoreSpaces" density="compact" hide-details label="Ignore spaces" />
      </div>

      <div v-if="a || b" class="text-caption text-medium-emphasis mt-1">
        Sorted A: <code>{{ sortedA }}</code>
      </div>
      <div v-if="a || b" class="text-caption text-medium-emphasis">
        Sorted B: <code>{{ sortedB }}</code>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const a = ref('')
const b = ref('')
const ignoreCase = ref(true)
const ignoreSpaces = ref(true)

function normalize(s: string): string {
  let out = s
  if (ignoreCase.value) out = out.toLowerCase()
  if (ignoreSpaces.value) out = out.replace(/\s+/g, '')
  return out
}

function sortChars(s: string): string {
  return Array.from(normalize(s)).sort().join('')
}

const sortedA = computed(() => sortChars(a.value))
const sortedB = computed(() => sortChars(b.value))

interface Verdict {
  key: 'match' | 'nomatch' | 'empty'
  label: string
  icon: string
}

const verdict = computed<Verdict>(() => {
  if (!a.value || !b.value) return { key: 'empty', label: 'Enter both strings', icon: 'mdi-help-circle-outline' }
  if (sortedA.value === sortedB.value) return { key: 'match', label: 'Anagrams', icon: 'mdi-check-circle' }
  return { key: 'nomatch', label: 'Not anagrams', icon: 'mdi-close-circle' }
})
</script>

<style scoped>
.anagram-result {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.1);
}

.anagram-result--match {
  background: #F0FDF4;
  color: #166534;
}

.anagram-result--match :deep(.v-icon) {
  color: #16A34A !important;
}

.anagram-result--nomatch {
  background: #FEF2F2;
  color: #991B1B;
}

.anagram-result--nomatch :deep(.v-icon) {
  color: #DC2626 !important;
}

.anagram-result--empty {
  color: #94A3B8;
}

code {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 1px 4px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 3px;
}
</style>
