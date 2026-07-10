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
        title="Regex tester"
        size="large"
      >
        <v-icon size="22">mdi-regex</v-icon>
      </v-btn>
    </template>

    <v-card min-width="400" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model="pattern"
          label="Pattern"
          density="compact"
          variant="outlined"
          hide-details
          class="flex-grow-1"
          placeholder="e.g. \\d+"
        />
        <v-text-field
          v-model="flags"
          label="Flags"
          density="compact"
          variant="outlined"
          hide-details
          class="regex-flags"
          placeholder="gi"
        />
      </div>
      <v-textarea
        v-model="input"
        label="Test string"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-2"
      />
      <div v-if="error" class="text-error text-body-2 mb-2">{{ error }}</div>
      <template v-else>
        <div class="text-caption text-medium-emphasis mb-1">
          {{ matches.length }} match{{ matches.length === 1 ? '' : 'es' }}
        </div>
        <div class="regex-out">
          <div v-if="!matches.length" class="text-caption text-medium-emphasis">
            No matches.
          </div>
          <div v-for="(m, i) in matches" :key="i" class="regex-row">
            <span class="regex-idx">#{{ i + 1 }}</span>
            <code class="regex-match">{{ m.value }}</code>
            <span class="regex-pos">at {{ m.index }}</span>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Match {
  value: string
  index: number
}

const open = ref(false)
const pattern = ref('')
const flags = ref('g')
const input = ref('')
const error = ref('')

const matches = computed<Match[]>(() => {
  error.value = ''
  if (!pattern.value) return []
  try {
    const flag = flags.value.includes('g') ? flags.value : flags.value + 'g'
    const re = new RegExp(pattern.value, flag)
    const out: Match[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(input.value)) !== null) {
      out.push({ value: m[0], index: m.index })
      if (m.index === re.lastIndex) re.lastIndex++
      if (out.length > 500) break
    }
    return out
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid regex'
    return []
  }
})
</script>

<style scoped>
.regex-flags {
  flex: 0 0 90px;
  max-width: 90px;
}

.regex-out {
  max-height: 180px;
  overflow: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.regex-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
}

.regex-idx {
  width: 32px;
  color: #94A3B8;
}

.regex-match {
  flex: 1;
  padding: 1px 6px;
  background: rgba(37, 99, 235, 0.12);
  color: #1E40AF;
  border-radius: 3px;
  word-break: break-all;
}

.regex-pos {
  color: #94A3B8;
  font-size: 10px;
}

.gap-8 {
  gap: 8px;
}
</style>
