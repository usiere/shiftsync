<template>
  <transition name="slide-down">
    <div v-if="visible" class="session-banner" role="status">
      <v-icon size="18" class="session-banner__icon">mdi-shield-alert-outline</v-icon>
      <span class="session-banner__text">
        Your session ends in <strong>{{ mmss }}</strong>. Sign in again to keep working.
      </span>
      <button class="session-banner__action" @click="signInAgain">Sign in again</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const WARN_WITHIN_MS = 2 * 60 * 1000

const authStore = useAuthStore()
const router = useRouter()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const msLeft = computed(() => {
  if (!authStore.expiresAt) return null
  return Math.max(0, authStore.expiresAt - now.value)
})

const visible = computed(() => {
  if (!authStore.isAuthenticated || msLeft.value == null) return false
  return msLeft.value > 0 && msLeft.value <= WARN_WITHIN_MS
})

const mmss = computed(() => {
  const secs = Math.ceil((msLeft.value ?? 0) / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

function signInAgain() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.session-banner {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #FFFBEB;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);
}

.session-banner__icon {
  color: #B45309 !important;
}

.session-banner__action {
  border: none;
  background: #B45309;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease;
}

.session-banner__action:hover {
  background: #92400E;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translate(-50%, -120%);
  opacity: 0;
}
</style>
