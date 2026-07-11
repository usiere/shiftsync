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
        :title="tooltip"
        size="large"
      >
        <v-badge
          v-if="openTodoCount > 0"
          :content="openTodoCount"
          color="primary"
          location="top end"
          offset-x="-4"
          offset-y="4"
        >
          <v-icon size="22">mdi-checkbox-marked-outline</v-icon>
        </v-badge>
        <v-icon v-else size="22">mdi-checkbox-blank-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-text-field
        v-model="draft"
        label="New todo"
        density="compact"
        variant="outlined"
        hide-details
        autofocus
        @keydown.enter.prevent="submit"
      />
      <div class="todo-list mt-2">
        <div v-if="!todos.length" class="text-caption text-medium-emphasis pa-2">
          No todos yet.
        </div>
        <div v-for="t in todos" :key="t.id" class="todo-row">
          <v-checkbox
            v-model="t.done"
            density="compact"
            hide-details
            class="todo-check"
          />
          <span class="todo-text" :class="{ 'todo-text--done': t.done }">
            {{ t.text }}
          </span>
          <v-btn size="x-small" variant="text" @click="removeTodo(t.id)">
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-if="todos.length" class="d-flex align-center mt-2">
        <span class="text-caption text-medium-emphasis flex-grow-1">
          {{ openTodoCount }} open · {{ todos.length - openTodoCount }} done
        </span>
        <v-btn size="small" variant="text" @click="clearCompleted">
          Clear done
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  addTodo,
  clearCompleted,
  openTodoCount,
  removeTodo,
  todos,
} from '../utils/quickTodos'

const open = ref(false)
const draft = ref('')

function submit() {
  addTodo(draft.value)
  draft.value = ''
}

const tooltip = computed(() =>
  openTodoCount.value
    ? `Quick todos (${openTodoCount.value} open)`
    : 'Quick todos',
)
</script>

<style scoped>
.todo-list {
  max-height: 240px;
  overflow-y: auto;
}

.todo-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-check {
  flex: 0 0 32px;
}

.todo-text {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  word-break: break-word;
}

.todo-text--done {
  color: #94A3B8;
  text-decoration: line-through;
}
</style>
