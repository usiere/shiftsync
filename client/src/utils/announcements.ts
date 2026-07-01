import { computed, ref } from 'vue'

export interface Announcement {
  id: string
  title: string
  message: string
  variant?: 'info' | 'warning' | 'success'
  actionLabel?: string
  actionHref?: string
}

const STORAGE_KEY = 'shiftsync.dismissedAnnouncements'

// Current published announcements. Adding a new entry (with a new id)
// makes it appear for everyone; users can dismiss it individually.
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '2026-07-onboarding-tour',
    title: 'New: keyboard-first navigation',
    message: 'Press ⌘K to jump anywhere, or ? to see all shortcuts.',
    variant: 'info',
  },
]

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

const dismissed = ref<string[]>(readDismissed())

export const activeAnnouncement = computed<Announcement | null>(() => {
  for (const a of ANNOUNCEMENTS) {
    if (!dismissed.value.includes(a.id)) return a
  }
  return null
})

export function dismissAnnouncement(id: string): void {
  if (dismissed.value.includes(id)) return
  dismissed.value = [...dismissed.value, id]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed.value))
  } catch {
    /* ignore */
  }
}
