<template>
  <v-menu location="bottom end">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon
        variant="text"
        class="me-2"
        title="Motion preference"
        size="large"
      >
        <v-icon size="22">{{ activeIcon }}</v-icon>
      </v-btn>
    </template>

    <v-list class="motion-menu" density="compact">
      <div class="motion-menu__title">Reduce motion</div>
      <button
        v-for="opt in options"
        :key="opt.value"
        class="motion-menu__item"
        :class="{ 'motion-menu__item--active': pref === opt.value }"
        @click="select(opt.value)"
      >
        <v-icon size="16" class="motion-menu__icon">{{ opt.icon }}</v-icon>
        <span class="motion-menu__label">{{ opt.label }}</span>
        <v-icon
          v-if="pref === opt.value"
          size="16"
          class="motion-menu__check"
        >
          mdi-check
        </v-icon>
      </button>
      <div class="motion-menu__hint">
        Disables non-essential animations and transitions across the app.
      </div>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  reducedMotionPref,
  setReducedMotion,
  type ReducedMotionPref,
} from '../utils/reducedMotion'

const pref = reducedMotionPref

const options: Array<{ value: ReducedMotionPref; label: string; icon: string }> = [
  { value: 'system', label: 'Match system', icon: 'mdi-monitor' },
  { value: 'off', label: 'Full motion', icon: 'mdi-animation-play' },
  { value: 'on', label: 'Reduce motion', icon: 'mdi-motion-pause' },
]

const activeIcon = computed(() => {
  const opt = options.find((o) => o.value === pref.value)
  return opt ? opt.icon : 'mdi-motion'
})

function select(value: ReducedMotionPref) {
  setReducedMotion(value)
}
</script>

<style scoped>
.motion-menu {
  min-width: 220px;
  padding: 8px;
}

.motion-menu__title {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  padding: 4px 8px 8px;
}

.motion-menu__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  text-align: left;
  transition: background 120ms ease;
}

.motion-menu__item:hover {
  background: rgba(148, 163, 184, 0.12);
}

.motion-menu__item--active {
  background: #EFF6FF;
  color: #1D4ED8;
}

.motion-menu__icon {
  color: #94A3B8 !important;
}

.motion-menu__item--active .motion-menu__icon,
.motion-menu__item--active .motion-menu__check {
  color: #2563EB !important;
}

.motion-menu__label {
  flex: 1;
}

.motion-menu__hint {
  padding: 8px 10px 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
}
</style>
