<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Jump to today (T)"
    size="large"
    @click="onClick"
  >
    <v-icon size="22">mdi-calendar-today</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { requestJumpToToday } from '../utils/jumpToToday'

function onClick() {
  requestJumpToToday()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function onKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented) return
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
  if (e.key !== 't' && e.key !== 'T') return
  if (isEditableTarget(e.target)) return
  e.preventDefault()
  requestJumpToToday()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
