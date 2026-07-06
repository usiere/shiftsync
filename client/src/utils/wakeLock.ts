import { ref } from 'vue'

interface WakeLockSentinelLike {
  release(): Promise<void>
  addEventListener(type: 'release', listener: () => void): void
}

interface WakeLockNavigator extends Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinelLike>
  }
}

export const wakeLockActive = ref<boolean>(false)
export const wakeLockSupported = ref<boolean>(
  typeof (navigator as WakeLockNavigator).wakeLock !== 'undefined',
)

let sentinel: WakeLockSentinelLike | null = null

async function acquire(): Promise<boolean> {
  const nav = navigator as WakeLockNavigator
  if (!nav.wakeLock) return false
  try {
    sentinel = await nav.wakeLock.request('screen')
    sentinel.addEventListener('release', () => {
      wakeLockActive.value = false
      sentinel = null
    })
    wakeLockActive.value = true
    return true
  } catch {
    wakeLockActive.value = false
    return false
  }
}

async function release(): Promise<void> {
  if (!sentinel) {
    wakeLockActive.value = false
    return
  }
  try {
    await sentinel.release()
  } catch {
    /* ignore */
  }
  sentinel = null
  wakeLockActive.value = false
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLockActive.value && !sentinel) {
    void acquire()
  }
})

export async function toggleWakeLock(): Promise<boolean> {
  if (wakeLockActive.value) {
    await release()
    return false
  }
  return acquire()
}
