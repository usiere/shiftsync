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
        title="Compare two blocks of text"
        size="large"
      >
        <v-icon size="22">mdi-file-compare</v-icon>
      </v-btn>
    </template>

    <v-card min-width="480" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-textarea
          v-model="a"
          label="A"
          density="compact"
          variant="outlined"
          rows="4"
          hide-details
        />
        <v-textarea
          v-model="b"
          label="B"
          density="compact"
          variant="outlined"
          rows="4"
          hide-details
        />
      </div>

      <div class="d-flex align-center mb-2">
        <span class="text-caption text-medium-emphasis">
          {{ addCount }} added · {{ removeCount }} removed
        </span>
      </div>

      <div class="diff-out">
        <div v-for="(line, i) in diff" :key="i" class="diff-line" :class="`diff-line--${line.op}`">
          <span class="diff-mark">{{ mark(line.op) }}</span>
          <span class="diff-text">{{ line.text || ' ' }}</span>
        </div>
        <div v-if="diff.length === 0" class="text-caption text-medium-emphasis">
          No differences yet — start typing.
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Line {
  op: 'same' | 'add' | 'remove'
  text: string
}

const open = ref(false)
const a = ref('')
const b = ref('')

function lineDiff(aText: string, bText: string): Line[] {
  const aLines = aText.split('\n')
  const bLines = bText.split('\n')
  const m = aLines.length
  const n = bLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  )
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = aLines[i] === bLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out: Line[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (aLines[i] === bLines[j]) {
      out.push({ op: 'same', text: aLines[i] })
      i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ op: 'remove', text: aLines[i] })
      i++
    } else {
      out.push({ op: 'add', text: bLines[j] })
      j++
    }
  }
  while (i < m) { out.push({ op: 'remove', text: aLines[i++] }) }
  while (j < n) { out.push({ op: 'add', text: bLines[j++] }) }
  return out
}

const diff = computed(() => {
  if (!a.value && !b.value) return []
  return lineDiff(a.value, b.value)
})

const addCount = computed(() => diff.value.filter((l) => l.op === 'add').length)
const removeCount = computed(() => diff.value.filter((l) => l.op === 'remove').length)

function mark(op: Line['op']): string {
  if (op === 'add') return '+'
  if (op === 'remove') return '−'
  return ' '
}
</script>

<style scoped>
.diff-out {
  max-height: 220px;
  overflow: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  line-height: 1.5;
}

.diff-line {
  display: flex;
  gap: 8px;
}

.diff-mark {
  width: 12px;
  color: #94A3B8;
  flex-shrink: 0;
  text-align: center;
}

.diff-text {
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-line--add {
  background: rgba(34, 197, 94, 0.12);
}

.diff-line--add .diff-mark {
  color: #16A34A;
}

.diff-line--remove {
  background: rgba(239, 68, 68, 0.12);
}

.diff-line--remove .diff-mark {
  color: #DC2626;
}

.gap-8 {
  gap: 8px;
}
</style>
