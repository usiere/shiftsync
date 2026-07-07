import { ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null

export const canInstall = ref<boolean>(false)
export const isInstalled = ref<boolean>(
  window.matchMedia('(display-mode: standalone)').matches,
)

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferred = event as BeforeInstallPromptEvent
  canInstall.value = true
})

window.addEventListener('appinstalled', () => {
  deferred = null
  canInstall.value = false
  isInstalled.value = true
})

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  try {
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    canInstall.value = false
    return outcome
  } catch {
    return 'dismissed'
  }
}
