<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="justCopied ? 'Copied!' : 'Copy link to this page'"
    size="large"
    @click="copyLink"
  >
    <v-icon size="22">
      {{ justCopied ? 'mdi-check' : 'mdi-link-variant' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const notify = useNotificationStore()
const justCopied = ref(false)

async function copyLink() {
  const url = window.location.href
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    justCopied.value = true
    setTimeout(() => (justCopied.value = false), 1200)
    notify.showSuccess('Link copied', 'The page URL is on your clipboard.')
  } catch {
    notify.showError('Copy failed', 'Your browser blocked clipboard access.')
  }
}
</script>
