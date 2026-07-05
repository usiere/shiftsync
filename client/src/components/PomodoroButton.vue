<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="pomo-btn" :class="stateClass" :title="tooltip">
        <v-icon size="18" class="pomo-btn__icon">{{ icon }}</v-icon>
        <span v-if="pomodoroRunning" class="pomo-btn__label">{{ pomodoroLabel }}</span>
      </button>
    </template>

    <v-list density="compact" min-width="220">
      <v-list-subheader>Pomodoro timer</v-list-subheader>
      <v-list-item v-if="!pomodoroRunning" @click="startPomodoro">
        <template v-slot:prepend>
          <v-icon size="18" color="primary">mdi-play</v-icon>
        </template>
        <v-list-item-title>Start 25/5 cycle</v-list-item-title>
      </v-list-item>
      <template v-else>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon size="18">{{ pomodoroMode === 'work' ? 'mdi-briefcase' : 'mdi-coffee' }}</v-icon>
          </template>
          <v-list-item-title>
            {{ pomodoroMode === 'work' ? 'Working' : 'On break' }} — {{ pomodoroLabel }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="skipPomodoroPhase">
          <template v-slot:prepend>
            <v-icon size="18">mdi-skip-next</v-icon>
          </template>
          <v-list-item-title>Skip to next phase</v-list-item-title>
        </v-list-item>
        <v-list-item @click="stopPomodoro">
          <template v-slot:prepend>
            <v-icon size="18" color="error">mdi-stop</v-icon>
          </template>
          <v-list-item-title>Stop timer</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  pomodoroLabel,
  pomodoroMode,
  pomodoroRunning,
  skipPomodoroPhase,
  startPomodoro,
  stopPomodoro,
} from '../utils/pomodoro'

const icon = computed(() => {
  if (!pomodoroRunning.value) return 'mdi-timer-outline'
  return pomodoroMode.value === 'work' ? 'mdi-briefcase-clock' : 'mdi-coffee-outline'
})

const stateClass = computed(() => {
  if (!pomodoroRunning.value) return ''
  return pomodoroMode.value === 'work' ? 'pomo-btn--work' : 'pomo-btn--break'
})

const tooltip = computed(() => {
  if (!pomodoroRunning.value) return 'Pomodoro timer'
  const phase = pomodoroMode.value === 'work' ? 'Work phase' : 'Break phase'
  return `${phase} — ${pomodoroLabel.value} left`
})
</script>

<style scoped>
.pomo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  margin-right: 8px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.pomo-btn:hover {
  background: rgba(148, 163, 184, 0.08);
}

.pomo-btn__icon {
  color: #94A3B8 !important;
}

.pomo-btn--work {
  border-color: #FCA5A5;
  background: #FEF2F2;
  color: #991B1B;
}

.pomo-btn--work .pomo-btn__icon {
  color: #DC2626 !important;
}

.pomo-btn--break {
  border-color: #86EFAC;
  background: #F0FDF4;
  color: #166534;
}

.pomo-btn--break .pomo-btn__icon {
  color: #16A34A !important;
}
</style>
