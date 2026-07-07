<template>
  <div class="offset-chip" :title="tooltip">
    <v-icon size="14" class="offset-chip__icon">mdi-clock-plus-outline</v-icon>
    <span class="offset-chip__label">UTC{{ offsetLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const offsetLabel = computed(() => {
  const total = -now.value.getTimezoneOffset()
  const sign = total >= 0 ? '+' : '-'
  const abs = Math.abs(total)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const tzName = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone)

const tooltip = computed(
  () => `Time zone: ${tzName.value} — offset UTC${offsetLabel.value}`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.offset-chip {
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

.offset-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1200px) {
  .offset-chip {
    display: none;
  }
}
</style>
