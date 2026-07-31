<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Look-and-say sequence"
        size="large"
      >
        <v-icon size="22">mdi-eye-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Look-and-say</div>
      <v-text-field
        v-model="seed"
        label="Seed (digits only)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-text-field
        v-model.number="steps"
        type="number"
        label="Steps (1–10)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="ls-list">
          <div v-for="(v, i) in sequence" :key="i" class="ls-row">
            <span class="ls-idx">{{ i }}</span>
            <span class="ls-val">{{ v }}</span>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const seed = ref<string>('1')
const steps = ref<number>(6)

const error = computed(() => {
  if (!/^\d+$/.test(seed.value)) return 'Digits only'
  if (seed.value.length > 20) return 'Seed too long'
  const s = Number(steps.value)
  if (!Number.isInteger(s) || s < 1 || s > 10) return 'Steps must be 1–10'
  return ''
})

function say(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    out += `${j - i}${s[i]}`
    i = j
  }
  return out
}

const sequence = computed<string[]>(() => {
  if (error.value) return []
  const out = [seed.value]
  for (let i = 1; i < Number(steps.value); i++) {
    out.push(say(out[i - 1]))
  }
  return out
})
</script>

<style scoped>
.ls-list {
  max-height: 160px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  background: white;
}

.ls-idx {
  min-width: 20px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #94A3B8;
}

.ls-val {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  word-break: break-all;
  font-size: 12px;
}
</style>
