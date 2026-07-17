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
        title="Random color"
        size="large"
      >
        <v-icon size="22">mdi-palette-swatch-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="rc-swatch" :style="{ background: color }" />
      <div class="d-flex align-center gap-8 mt-3">
        <code class="rc-hex flex-grow-1">{{ color }}</code>
        <v-btn size="small" variant="text" @click="copy(color)">
          <v-icon size="16">mdi-content-copy</v-icon>
        </v-btn>
      </div>
      <v-btn class="mt-2" size="small" variant="tonal" color="primary" block @click="generate">
        <v-icon start size="16">mdi-refresh</v-icon>
        New color
      </v-btn>
      <div class="rc-history mt-3">
        <button
          v-for="c in history"
          :key="c"
          class="rc-history-item"
          :style="{ background: c }"
          :title="c"
          @click="copy(c)"
        />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const color = ref('#2563EB')
const history = ref<string[]>([])
const notify = useNotificationStore()

function generate() {
  const bytes = new Uint8Array(3)
  crypto.getRandomValues(bytes)
  const hex = '#' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  color.value = hex
  history.value = [hex, ...history.value.filter((c) => c !== hex)].slice(0, 8)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Color copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}

onMounted(generate)
</script>

<style scoped>
.rc-swatch {
  width: 100%;
  height: 90px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.rc-hex {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  text-align: center;
  letter-spacing: 0.02em;
}

.rc-history {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.rc-history-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  cursor: pointer;
  padding: 0;
}

.gap-8 {
  gap: 8px;
}
</style>
