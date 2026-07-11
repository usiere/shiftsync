import { computed, ref, watch } from 'vue'

export interface Todo {
  id: string
  text: string
  done: boolean
}

const STORAGE_KEY = 'shiftsync.quickTodos'

function read(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is Todo =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as Todo).id === 'string' &&
        typeof (t as Todo).text === 'string' &&
        typeof (t as Todo).done === 'boolean',
    )
  } catch {
    return []
  }
}

export const todos = ref<Todo[]>(read())

watch(
  todos,
  (value) => {
    try {
      if (value.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  },
  { deep: true },
)

export const openTodoCount = computed(
  () => todos.value.filter((t) => !t.done).length,
)

export function addTodo(text: string): void {
  const trimmed = text.trim()
  if (!trimmed) return
  todos.value.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: trimmed,
    done: false,
  })
}

export function removeTodo(id: string): void {
  todos.value = todos.value.filter((t) => t.id !== id)
}

export function clearCompleted(): void {
  todos.value = todos.value.filter((t) => !t.done)
}
