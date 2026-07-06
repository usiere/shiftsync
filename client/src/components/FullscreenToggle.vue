<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="isFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen'"
    size="large"
    @click="toggleFullscreen"
  >
    <v-icon size="22" :color="isFullscreen ? 'primary' : undefined">
      {{ isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isFullscreen = ref<boolean>(!!document.fullscreenElement)

function update() {
  isFullscreen.value = !!document.fullscreenElement
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', update)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', update)
})
</script>
