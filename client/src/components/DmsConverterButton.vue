<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Coordinate DD ↔ DMS converter"
        size="large"
      >
        <v-icon size="22">mdi-map-marker-radius-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-caption text-medium-emphasis mb-2">
        Enter latitude/longitude as decimal degrees
      </div>
      <div class="d-flex gap-8 mb-3">
        <v-text-field
          v-model.number="lat"
          type="number"
          label="Latitude"
          density="compact"
          variant="outlined"
          hide-details
          step="0.000001"
        />
        <v-text-field
          v-model.number="lng"
          type="number"
          label="Longitude"
          density="compact"
          variant="outlined"
          hide-details
          step="0.000001"
        />
      </div>

      <div class="dms-row">
        <span class="dms-label">DD</span>
        <code class="dms-value">{{ dd }}</code>
        <v-btn size="x-small" variant="text" @click="copy(dd)">
          <v-icon size="14">mdi-content-copy</v-icon>
        </v-btn>
      </div>
      <div class="dms-row">
        <span class="dms-label">DMS</span>
        <code class="dms-value">{{ dms }}</code>
        <v-btn size="x-small" variant="text" @click="copy(dms)">
          <v-icon size="14">mdi-content-copy</v-icon>
        </v-btn>
      </div>
      <div class="dms-row">
        <span class="dms-label">DMM</span>
        <code class="dms-value">{{ dmm }}</code>
        <v-btn size="x-small" variant="text" @click="copy(dmm)">
          <v-icon size="14">mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const lat = ref(37.7749)
const lng = ref(-122.4194)
const notify = useNotificationStore()

function toDms(value: number, positive: string, negative: string): string {
  const hemi = value >= 0 ? positive : negative
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = ((minFloat - min) * 60).toFixed(2)
  return `${deg}° ${min}' ${sec}" ${hemi}`
}

function toDmm(value: number, positive: string, negative: string): string {
  const hemi = value >= 0 ? positive : negative
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const min = ((abs - deg) * 60).toFixed(4)
  return `${deg}° ${min}' ${hemi}`
}

const dd = computed(() => `${lat.value.toFixed(6)}, ${lng.value.toFixed(6)}`)

const dms = computed(
  () => `${toDms(lat.value, 'N', 'S')}, ${toDms(lng.value, 'E', 'W')}`,
)

const dmm = computed(
  () => `${toDmm(lat.value, 'N', 'S')}, ${toDmm(lng.value, 'E', 'W')}`,
)

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Coordinates copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.dms-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.dms-label {
  width: 40px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dms-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}

.gap-8 {
  gap: 8px;
}
</style>
