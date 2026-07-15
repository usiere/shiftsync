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
        title="Caesar cipher"
        size="large"
      >
        <v-icon size="22">mdi-alphabetical-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <span class="text-caption text-medium-emphasis" style="width: 60px">Shift</span>
        <v-slider
          v-model="shift"
          :min="-25"
          :max="25"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="cipher-value">{{ shift }}</span>
        <v-btn size="x-small" variant="text" @click="shift = 13" title="ROT13">
          ROT13
        </v-btn>
      </div>
      <div class="cipher-out mb-2">
        <div class="cipher-out__value">{{ output || '—' }}</div>
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
const shift = ref(3)
const notify = useNotificationStore()

function shiftChar(ch: string, k: number): string {
  const code = ch.charCodeAt(0)
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + k + 26 * 100) % 26) + 65)
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + k + 26 * 100) % 26) + 97)
  }
  return ch
}

const output = computed(() => {
  const k = ((shift.value % 26) + 26) % 26
  return input.value.split('').map((c) => shiftChar(c, k)).join('')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Ciphered text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.cipher-value {
  width: 24px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.cipher-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.cipher-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}

.gap-8 {
  gap: 8px;
}
</style>
