<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Pig Latin translator"
        size="large"
      >
        <v-icon size="22">mdi-pig-variant-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Pig Latin</div>
      <v-textarea
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        rows="3"
        no-resize
        class="mb-2"
      />
      <div class="pl-out">
        <div class="text-caption text-medium-emphasis">Translation</div>
        <div class="pl-mono">{{ translated || 'Ypetay omethingsay…' }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')

function preserveCase(orig: string, transformed: string): string {
  if (!orig) return transformed
  if (orig.toUpperCase() === orig) return transformed.toUpperCase()
  if (orig[0] === orig[0].toUpperCase()) {
    return transformed.charAt(0).toUpperCase() + transformed.slice(1).toLowerCase()
  }
  return transformed.toLowerCase()
}

function translateWord(w: string): string {
  const match = w.match(/^([A-Za-z]+)(.*)$/)
  if (!match) return w
  const [, core, tail] = match
  const lower = core.toLowerCase()
  const vowels = /[aeiou]/
  let out: string
  if (vowels.test(lower[0])) {
    out = lower + 'way'
  } else {
    const firstVowel = lower.search(vowels)
    if (firstVowel === -1) {
      out = lower + 'ay'
    } else {
      out = lower.slice(firstVowel) + lower.slice(0, firstVowel) + 'ay'
    }
  }
  return preserveCase(core, out) + tail
}

const translated = computed(() =>
  text.value.replace(/[A-Za-z]+[^\s]*/g, (w) => translateWord(w)),
)
</script>

<style scoped>
.pl-out {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.pl-mono {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #1E40AF;
  word-break: break-word;
  margin-top: 2px;
}
</style>
