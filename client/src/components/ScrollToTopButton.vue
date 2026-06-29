<template>
  <transition name="fab-fade">
    <button
      v-if="visible"
      class="scroll-top-btn"
      title="Back to top"
      aria-label="Scroll to top"
      @click="scrollToTop"
    >
      <v-icon size="22">mdi-arrow-up</v-icon>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SHOW_AFTER_PX = 320
const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.scroll-top-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.15);
  z-index: 998;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.scroll-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
}

.scroll-top-btn .v-icon {
  color: #2563EB !important;
}

.v-theme--dark .scroll-top-btn {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(255, 255, 255, 0.08);
}

.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
