<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="armed ? `Alarm at ${targetTime}` : 'Alarm'"
        size="large"
      >
        <v-icon size="22" :color="armed ? 'warning' : undefined">
          {{ armed ? 'mdi-alarm' : 'mdi-alarm-plus' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2">One-off alarm</div>
      <v-text-field
        v-model="time"
        type="time"
        label="Fire at"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />
      <div v-if="armed" class="text-caption text-medium-emphasis mb-2">
        Armed for {{ targetTime }} · {{ remainingLabel }} left
      </div>
      <div class="d-flex">
        <v-btn v-if="!armed" color="primary" size="small" prepend-icon="mdi-alarm" @click="arm">
          Arm
        </v-btn>
        <v-btn v-else color="error" size="small" prepend-icon="mdi-alarm-off" @click="disarm">
          Cancel
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const time = ref('')
const armed = ref(false)
const targetTs = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null
const notify = useNotificationStore()

const targetTime = computed(() => {
  if (!targetTs.value) return ''
  return new Date(targetTs.value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const remainingLabel = computed(() => {
  const ms = Math.max(0, targetTs.value - now.value)
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
})

function arm() {
  if (!time.value) return
  const [hh, mm] = time.value.split(':').map(Number)
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1)
  }
  targetTs.value = target.getTime()
  armed.value = true
  now.value = Date.now()
  if (ticker) clearInterval(ticker)
  ticker = setInterval(() => {
    now.value = Date.now()
    if (armed.value && now.value >= targetTs.value) {
      fire()
    }
  }, 1000)
}

function disarm() {
  armed.value = false
  targetTs.value = 0
  if (ticker) clearInterval(ticker)
  ticker = null
}

function fire() {
  notify.showToast({
    type: 'warning',
    title: 'Alarm',
    message: `It is now ${targetTime.value}`,
    timeout: 10_000,
  })
  disarm()
}

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
  ticker = null
})
</script>
