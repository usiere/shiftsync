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
        title="Lorem ipsum generator"
        size="large"
      >
        <v-icon size="22">mdi-text-box-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-select
          v-model="unit"
          :items="[
            { title: 'Paragraphs', value: 'paragraphs' },
            { title: 'Sentences', value: 'sentences' },
            { title: 'Words', value: 'words' },
          ]"
          label="Unit"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model.number="count"
          type="number"
          label="Count"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
          max="20"
          class="lorem-count"
        />
      </div>
      <div class="lorem-out mb-2">
        <div v-for="(p, i) in paragraphs" :key="i" class="mb-2">{{ p }}</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" @click="regen">
          <v-icon start size="16">mdi-refresh</v-icon>
          New
        </v-btn>
        <v-btn size="small" variant="text" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

type Unit = 'paragraphs' | 'sentences' | 'words'

const open = ref(false)
const unit = ref<Unit>('paragraphs')
const count = ref(3)
const seed = ref(0)
const notify = useNotificationStore()

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'in', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

function rng(s: number): () => number {
  let state = s || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function word(rand: () => number): string {
  return WORDS[Math.floor(rand() * WORDS.length)]
}

function sentence(rand: () => number, minWords = 6, maxWords = 14): string {
  const n = Math.floor(rand() * (maxWords - minWords + 1)) + minWords
  const parts: string[] = []
  for (let i = 0; i < n; i++) parts.push(word(rand))
  const text = parts.join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1) + '.'
}

function paragraph(rand: () => number): string {
  const n = Math.floor(rand() * 4) + 3
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(sentence(rand))
  return out.join(' ')
}

const paragraphs = computed(() => {
  const rand = rng(seed.value + count.value + unit.value.length * 17)
  const clamped = Math.max(1, Math.min(20, count.value || 1))
  if (unit.value === 'words') {
    return [Array.from({ length: clamped }, () => word(rand)).join(' ')]
  }
  if (unit.value === 'sentences') {
    return [Array.from({ length: clamped }, () => sentence(rand)).join(' ')]
  }
  return Array.from({ length: clamped }, () => paragraph(rand))
})

function regen() {
  seed.value = Math.floor(Math.random() * 100_000_000)
}

watch(open, (v) => {
  if (v) regen()
})

async function copy() {
  try {
    await navigator.clipboard.writeText(paragraphs.value.join('\n\n'))
    notify.showToast({
      type: 'success',
      title: 'Lorem ipsum copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.lorem-count {
  flex: 0 0 90px;
  max-width: 90px;
}

.lorem-out {
  max-height: 220px;
  overflow-y: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  line-height: 1.5;
}

.gap-8 {
  gap: 8px;
}
</style>
