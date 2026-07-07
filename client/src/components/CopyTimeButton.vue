<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Copy current time"
        size="large"
      >
        <v-icon size="22">mdi-clipboard-text-clock-outline</v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="260">
      <v-list-subheader>Copy current time</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.key"
        :title="opt.label"
        :subtitle="opt.preview"
        @click="copy(opt.key)"
      >
        <template v-slot:prepend>
          <v-icon size="18">mdi-content-copy</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

type Format = 'iso' | 'local' | 'time' | 'date' | 'epoch'

const notify = useNotificationStore()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function fmt(key: Format, date: Date): string {
  switch (key) {
    case 'iso': return date.toISOString()
    case 'local': return date.toLocaleString()
    case 'time': return date.toLocaleTimeString()
    case 'date': return date.toLocaleDateString()
    case 'epoch': return String(Math.floor(date.getTime() / 1000))
  }
}

const options = computed(() => {
  const d = now.value
  return [
    { key: 'iso' as Format, label: 'ISO 8601 (UTC)', preview: fmt('iso', d) },
    { key: 'local' as Format, label: 'Local date & time', preview: fmt('local', d) },
    { key: 'time' as Format, label: 'Local time only', preview: fmt('time', d) },
    { key: 'date' as Format, label: 'Local date only', preview: fmt('date', d) },
    { key: 'epoch' as Format, label: 'Unix timestamp (seconds)', preview: fmt('epoch', d) },
  ]
})

async function copy(key: Format) {
  const value = fmt(key, new Date())
  try {
    await navigator.clipboard.writeText(value)
    notify.showToast({
      type: 'success',
      title: 'Copied time',
      message: value,
    })
  } catch {
    notify.showToast({
      type: 'warning',
      title: 'Copy failed',
      message: 'Could not access clipboard.',
    })
  }
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>
