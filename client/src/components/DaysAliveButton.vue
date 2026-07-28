<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Days alive counter"
        size="large"
      >
        <v-icon size="22">mdi-cake-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Days alive</div>
      <v-text-field
        v-model="birthday"
        type="date"
        label="Birthday"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div v-if="!ms" class="text-caption text-medium-emphasis text-center">
        Pick a date.
      </div>
      <template v-else>
        <div class="da-row"><span>Days</span><span class="da-value">{{ format(days) }}</span></div>
        <div class="da-row"><span>Weeks</span><span class="da-value">{{ format(weeks) }}</span></div>
        <div class="da-row"><span>Hours</span><span class="da-value">{{ format(hours) }}</span></div>
        <div class="da-row"><span>Minutes</span><span class="da-value">{{ format(minutes) }}</span></div>
        <div class="da-row"><span>Heartbeats*</span><span class="da-value">{{ format(heartbeats) }}</span></div>
        <div class="text-caption text-medium-emphasis mt-1">*≈ 70 bpm estimate</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const birthday = ref('')

const ms = computed(() => {
  if (!birthday.value) return 0
  const d = new Date(birthday.value)
  if (Number.isNaN(d.getTime())) return 0
  const diff = Date.now() - d.getTime()
  return diff > 0 ? diff : 0
})

const days = computed(() => Math.floor(ms.value / 86_400_000))
const weeks = computed(() => Math.floor(ms.value / (7 * 86_400_000)))
const hours = computed(() => Math.floor(ms.value / 3_600_000))
const minutes = computed(() => Math.floor(ms.value / 60_000))
const heartbeats = computed(() => Math.floor((ms.value / 60_000) * 70))

function format(n: number): string {
  return n.toLocaleString()
}
</script>

<style scoped>
.da-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.06);
  margin-bottom: 3px;
  font-size: 12px;
}

.da-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
