import { ref, watch } from 'vue'

export interface Bookmark {
  id: string
  path: string
  title: string
  addedAt: string
}

const STORAGE_KEY = 'shiftsync.bookmarks'

function read(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b): b is Bookmark =>
        typeof b === 'object' &&
        b !== null &&
        typeof (b as Bookmark).id === 'string' &&
        typeof (b as Bookmark).path === 'string' &&
        typeof (b as Bookmark).title === 'string',
    )
  } catch {
    return []
  }
}

export const bookmarks = ref<Bookmark[]>(read())

watch(
  bookmarks,
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

export function addBookmark(path: string, title: string): void {
  if (bookmarks.value.some((b) => b.path === path)) return
  bookmarks.value.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    path,
    title: title || path,
    addedAt: new Date().toISOString(),
  })
}

export function removeBookmark(id: string): void {
  bookmarks.value = bookmarks.value.filter((b) => b.id !== id)
}
