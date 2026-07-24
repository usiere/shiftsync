<template>
  <div class="sn-chip" :class="`sn-chip--${season.key}`" :title="tooltip">
    <v-icon size="14" class="sn-chip__icon">{{ season.icon }}</v-icon>
    <span class="sn-chip__label">{{ season.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const season = computed(() => {
  const m = now.value.getMonth() + 1
  if (m >= 3 && m <= 5) return { key: 'spring', label: 'Spring', icon: 'mdi-flower-tulip' }
  if (m >= 6 && m <= 8) return { key: 'summer', label: 'Summer', icon: 'mdi-white-balance-sunny' }
  if (m >= 9 && m <= 11) return { key: 'autumn', label: 'Autumn', icon: 'mdi-leaf-maple' }
  return { key: 'winter', label: 'Winter', icon: 'mdi-snowflake' }
})

const tooltip = computed(
  () => `Current season (Northern Hemisphere): ${season.value.label}`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.sn-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.sn-chip__icon {
  color: #94A3B8 !important;
}

.sn-chip--spring { background: #DCFCE7; border-color: #86EFAC; color: #166534; }
.sn-chip--spring .sn-chip__icon { color: #16A34A !important; }

.sn-chip--summer { background: #FEF3C7; border-color: #FCD34D; color: #92400E; }
.sn-chip--summer .sn-chip__icon { color: #F59E0B !important; }

.sn-chip--autumn { background: #FFEDD5; border-color: #FDBA74; color: #9A3412; }
.sn-chip--autumn .sn-chip__icon { color: #EA580C !important; }

.sn-chip--winter { background: #E0F2FE; border-color: #BAE6FD; color: #075985; }
.sn-chip--winter .sn-chip__icon { color: #0284C7 !important; }

@media (max-width: 1200px) {
  .sn-chip {
    display: none;
  }
}
</style>
