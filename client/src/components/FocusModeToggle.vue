<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="focusMode ? 'Exit focus mode (Shift+F)' : 'Enter focus mode (Shift+F)'"
    size="large"
    @click="onClick"
  >
    <v-icon size="22">
      {{ focusMode ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { focusMode, toggleFocusMode } from '../utils/focusMode'

function onClick() {
  toggleFocusMode()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function onKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (!e.shiftKey) return
  if (e.key !== 'F' && e.key !== 'f') return
  if (isEditableTarget(e.target)) return
  e.preventDefault()
  toggleFocusMode()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
