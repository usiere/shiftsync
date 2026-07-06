<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Copy debug info (app version, browser, viewport, page)"
    size="large"
    @click="copyDebugInfo"
  >
    <v-icon size="22">mdi-bug-outline</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

const route = useRoute()
const notify = useNotificationStore()

async function copyDebugInfo() {
  const nav = navigator as NavigatorWithMemory
  const payload = [
    `App: ShiftSync v${__APP_VERSION__}`,
    `Built: ${__APP_BUILD_TIME__}`,
    `Page: ${route.fullPath}`,
    `URL: ${window.location.href}`,
    `Time: ${new Date().toISOString()}`,
    `Browser: ${navigator.userAgent}`,
    `Platform: ${navigator.platform || 'unknown'}`,
    `Language: ${navigator.language}`,
    `Cores: ${navigator.hardwareConcurrency || 'n/a'}`,
    `Memory: ${nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'n/a'}`,
    `Viewport: ${window.innerWidth}x${window.innerHeight}`,
    `Pixel ratio: ${window.devicePixelRatio}`,
    `Online: ${navigator.onLine ? 'yes' : 'no'}`,
    `Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  ].join('\n')

  try {
    await navigator.clipboard.writeText(payload)
    notify.showToast({
      type: 'success',
      title: 'Debug info copied',
      message: 'Paste it into a bug report or Slack message.',
    })
  } catch {
    notify.showToast({
      type: 'warning',
      title: 'Copy failed',
      message: 'Could not copy debug info — try again.',
    })
  }
}
</script>
