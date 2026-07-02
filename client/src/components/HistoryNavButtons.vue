<template>
  <div class="history-nav">
    <button
      class="history-nav__btn"
      :disabled="!canGoBack"
      title="Back (Alt+←)"
      aria-label="Back"
      @click="goBack"
    >
      <v-icon size="18">mdi-arrow-left</v-icon>
    </button>
    <button
      class="history-nav__btn"
      :disabled="!canGoForward"
      title="Forward (Alt+→)"
      aria-label="Forward"
      @click="goForward"
    >
      <v-icon size="18">mdi-arrow-right</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const canGoBack = ref(false)
const canGoForward = ref(false)

// The browser doesn't expose "how far back can we go" directly, but we
// can approximate: once the app has recorded more than one route change,
// Back is enabled. Forward is enabled only after the user has gone back.
let historyDepth = 0
let forwardDepth = 0

function refresh() {
  canGoBack.value = historyDepth > 0
  canGoForward.value = forwardDepth > 0
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function goBack() {
  if (!canGoBack.value) return
  historyDepth = Math.max(0, historyDepth - 1)
  forwardDepth += 1
  refresh()
  router.back()
}

function goForward() {
  if (!canGoForward.value) return
  forwardDepth = Math.max(0, forwardDepth - 1)
  historyDepth += 1
  refresh()
  router.forward()
}

function onKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented) return
  if (!e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return
  if (isEditableTarget(e.target)) return
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goBack()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    goForward()
  }
}

const unsubscribe = router.afterEach((_to, from) => {
  // Push navigations advance history depth and clear the forward stack;
  // back/forward navigations are handled explicitly in goBack/goForward
  // above so we only count "new" pushes here.
  if (from.fullPath !== '/') {
    historyDepth += 1
    forwardDepth = 0
    refresh()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  unsubscribe()
})
</script>

<style scoped>
.history-nav {
  display: inline-flex;
  gap: 2px;
  margin-right: 8px;
}

.history-nav__btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
}

.history-nav__btn:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.5);
}

.history-nav__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.history-nav__btn .v-icon {
  color: #64748B !important;
}
</style>
