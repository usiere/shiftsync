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
        title="NATO phonetic alphabet"
        size="large"
      >
        <v-icon size="22">mdi-radio</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-text-field
        v-model="input"
        label="Text to spell"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="e.g. ABC-123"
        class="mb-2"
      />
      <div class="nato-out mb-2">
        <div v-if="output" class="nato-out__value">{{ output }}</div>
        <div v-else class="text-caption text-medium-emphasis">Enter text above.</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!output" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const notify = useNotificationStore()

const LETTERS: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
}

const DIGITS: Record<string, string> = {
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
}

function speak(ch: string): string {
  const up = ch.toUpperCase()
  if (LETTERS[up]) return LETTERS[up]
  if (DIGITS[up]) return DIGITS[up]
  if (up === ' ') return '(space)'
  if (up === '-') return 'Dash'
  if (up === '.') return 'Stop'
  if (up === '/') return 'Slash'
  return `"${ch}"`
}

const output = computed(() => {
  if (!input.value) return ''
  return input.value
    .split('')
    .map(speak)
    .join(' ')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Phonetic copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.nato-out {
  min-height: 60px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.nato-out__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  line-height: 1.6;
}
</style>
