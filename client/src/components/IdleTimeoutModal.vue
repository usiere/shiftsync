<template>
  <v-dialog v-model="open" max-width="420" persistent>
    <v-card class="idle-card">
      <div class="idle-card__icon">
        <v-icon size="32" color="warning">mdi-clock-alert-outline</v-icon>
      </div>
      <v-card-title class="idle-card__title">Still there?</v-card-title>
      <v-card-text class="idle-card__text">
        You've been inactive for a while. You'll be signed out automatically in
        <strong>{{ secondsLeft }}s</strong> to keep your account secure.
      </v-card-text>
      <v-card-actions class="idle-card__actions">
        <v-btn variant="text" color="error" @click="signOutNow">Sign out now</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="stayActive">I'm still here</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const IDLE_MS = 15 * 60 * 1000
const WARN_MS = 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

const authStore = useAuthStore()
const router = useRouter()

const open = ref(false)
const secondsLeft = ref(Math.round(WARN_MS / 1000))

let idleTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let logoutTimer: ReturnType<typeof setTimeout> | null = null

function clearAll() {
  if (idleTimer) clearTimeout(idleTimer)
  if (logoutTimer) clearTimeout(logoutTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  idleTimer = null
  logoutTimer = null
  countdownTimer = null
}

function scheduleIdle() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(showWarning, IDLE_MS)
}

function showWarning() {
  if (!authStore.isAuthenticated) return
  open.value = true
  secondsLeft.value = Math.round(WARN_MS / 1000)
  countdownTimer = setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
  }, 1000)
  logoutTimer = setTimeout(signOutNow, WARN_MS)
}

function stayActive() {
  open.value = false
  clearAll()
  scheduleIdle()
}

function signOutNow() {
  clearAll()
  open.value = false
  authStore.logout()
  router.push('/login')
}

function onActivity() {
  if (open.value) return
  scheduleIdle()
}

const visible = computed(() => open.value)

onMounted(() => {
  scheduleIdle()
  for (const ev of ACTIVITY_EVENTS) {
    window.addEventListener(ev, onActivity, { passive: true })
  }
})

onBeforeUnmount(() => {
  clearAll()
  for (const ev of ACTIVITY_EVENTS) {
    window.removeEventListener(ev, onActivity)
  }
})

defineExpose({ visible })
</script>

<style scoped>
.idle-card {
  border-radius: 14px;
  padding: 8px 4px 4px;
}

.idle-card__icon {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.idle-card__title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  padding-top: 8px;
}

.idle-card__text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 4px 24px 8px;
}

.idle-card__actions {
  padding: 8px 16px 16px;
}
</style>
