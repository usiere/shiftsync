<template>
  <div class="scroll-progress" :style="{ width: pct + '%' }" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const pct = ref(0)

function update() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  if (max <= 0) {
    pct.value = 0
    return
  }
  const raw = (doc.scrollTop / max) * 100
  pct.value = Math.max(0, Math.min(100, raw))
}

onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563EB, #7C3AED);
  z-index: 2000;
  transition: width 60ms linear;
  pointer-events: none;
}
</style>
