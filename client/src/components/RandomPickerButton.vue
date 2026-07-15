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
        title="Random picker"
        size="large"
      >
        <v-icon size="22">mdi-hand-pointing-up</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="One entry per line"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        placeholder="Alice&#10;Bob&#10;Carol"
        class="mb-2"
      />
      <div class="text-caption text-medium-emphasis mb-2">
        {{ entries.length }} entries loaded
      </div>
      <div class="picker-result mb-2">
        <div v-if="picked" class="picker-result__value" :class="{ 'picker-result__value--roll': rolling }">
          {{ picked }}
        </div>
        <div v-else class="text-caption text-medium-emphasis">
          Click Pick to select randomly.
        </div>
      </div>
      <div class="d-flex align-center gap-8">
        <v-checkbox v-model="removePicked" density="compact" hide-details label="Remove after pick" />
        <v-spacer />
        <v-btn color="primary" size="small" :disabled="!entries.length" @click="pick">
          <v-icon start size="16">mdi-shuffle</v-icon>
          Pick
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref('')
const removePicked = ref(false)
const picked = ref('')
const rolling = ref(false)

const entries = computed(() =>
  input.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
)

function pick() {
  const list = entries.value
  if (!list.length) return
  rolling.value = true
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  const idx = bytes[0] % list.length
  const choice = list[idx]
  setTimeout(() => {
    picked.value = choice
    if (removePicked.value) {
      const lines = input.value.split('\n')
      let removed = false
      const next: string[] = []
      for (const line of lines) {
        if (!removed && line.trim() === choice) { removed = true; continue }
        next.push(line)
      }
      input.value = next.join('\n')
    }
    rolling.value = false
  }, 250)
}
</script>

<style scoped>
.picker-result {
  min-height: 60px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.08);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-result__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1E40AF;
  transition: transform 250ms ease;
}

.picker-result__value--roll {
  animation: roll 250ms ease;
}

@keyframes roll {
  0% { transform: rotate(-10deg) scale(0.8); opacity: 0.4; }
  100% { transform: rotate(0deg) scale(1); opacity: 1; }
}

.gap-8 {
  gap: 8px;
}
</style>
