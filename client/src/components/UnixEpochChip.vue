<template>
  <div class="ue-chip" :title="tooltip">
    <v-icon size="14" class="ue-chip__icon">mdi-timer-sand</v-icon>
    <span class="ue-chip__label">{{ epoch }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const epoch = computed(() => Math.floor(now.value / 1000).toString())

const tooltip = computed(
  () => `Unix epoch (seconds since 1970-01-01 UTC): ${epoch.value}`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.ue-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.ue-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1200px) {
  .ue-chip {
    display: none;
  }
}
</style>
