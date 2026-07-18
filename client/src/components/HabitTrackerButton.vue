<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="`Habits (${habits.length})`"
        size="large"
      >
        <v-badge
          v-if="doneCount > 0"
          :content="doneCount"
          color="success"
          location="top end"
          offset-x="-4"
          offset-y="4"
        >
          <v-icon size="22">mdi-clipboard-check-outline</v-icon>
        </v-badge>
        <v-icon v-else size="22">mdi-clipboard-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex align-center gap-8 mb-2">
        <v-text-field
          v-model="draft"
          label="New habit"
          density="compact"
          variant="outlined"
          hide-details
          @keydown.enter.prevent="submit"
        />
        <v-btn size="small" color="primary" variant="tonal" @click="submit" :disabled="!draft.trim()">
          Add
        </v-btn>
      </div>
      <div class="habit-list">
        <div v-if="!habits.length" class="text-caption text-medium-emphasis pa-2">
          No habits yet.
        </div>
        <div v-for="h in habits" :key="h.id" class="habit-row">
          <button class="habit-check" :class="{ 'habit-check--done': doneToday(h) }" @click="toggleToday(h.id)">
            <v-icon size="18">
              {{ doneToday(h) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
          </button>
          <span class="habit-name" :class="{ 'habit-name--done': doneToday(h) }">
            {{ h.name }}
          </span>
          <span class="habit-streak" :title="`${streak(h)}-day streak`">
            🔥 {{ streak(h) }}
          </span>
          <v-btn size="x-small" variant="text" @click="removeHabit(h.id)">
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  addHabit,
  doneToday,
  habits,
  removeHabit,
  streak,
  toggleToday,
} from '../utils/habits'

const open = ref(false)
const draft = ref('')

function submit() {
  addHabit(draft.value)
  draft.value = ''
}

const doneCount = computed(() => habits.value.filter(doneToday).length)
</script>

<style scoped>
.habit-list {
  max-height: 260px;
  overflow-y: auto;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.habit-check {
  border: none;
  background: transparent;
  padding: 2px;
  cursor: pointer;
  color: #94A3B8;
}

.habit-check--done {
  color: #16A34A;
}

.habit-name {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.habit-name--done {
  color: #94A3B8;
  text-decoration: line-through;
}

.habit-streak {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}

.gap-8 {
  gap: 8px;
}
</style>
