<template>
  <div v-if="chars > 0" class="sc-chip" :title="tooltip">
    <v-icon size="14" class="sc-chip__icon">mdi-selection</v-icon>
    <span class="sc-chip__label">{{ chars }} ch · {{ words }} w</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const chars = ref(0)
const words = ref(0)

function update() {
  const sel = window.getSelection()
  const text = sel ? sel.toString() : ''
  chars.value = text.length
  words.value = text.trim() ? text.trim().split(/\s+/).length : 0
}

const tooltip = computed(
  () => `Selection: ${chars.value} characters, ${words.value} words`,
)

onMounted(() => {
  document.addEventListener('selectionchange', update)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', update)
})
</script>

<style scoped>
.sc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #DBEAFE;
  border: 1px solid #93C5FD;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #1E40AF;
}

.sc-chip__icon {
  color: #2563EB !important;
}

@media (max-width: 1200px) {
  .sc-chip {
    display: none;
  }
}
</style>
