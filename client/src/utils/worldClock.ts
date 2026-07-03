import { ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.worldClockZone'

export interface WorldZoneOption {
  id: string
  label: string
}

export const WORLD_ZONE_OPTIONS: WorldZoneOption[] = [
  { id: '', label: 'Off' },
  { id: 'UTC', label: 'UTC' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'America/Chicago', label: 'Chicago' },
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'Europe/Istanbul', label: 'Istanbul' },
  { id: 'Africa/Lagos', label: 'Lagos' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Kolkata', label: 'Kolkata' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Australia/Sydney', label: 'Sydney' },
]

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export const worldClockZone = ref<string>(read())

watch(worldClockZone, (v) => {
  try {
    if (v) localStorage.setItem(STORAGE_KEY, v)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
})

export function setWorldClockZone(zone: string): void {
  worldClockZone.value = zone
}
