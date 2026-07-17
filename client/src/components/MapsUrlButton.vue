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
        title="Maps URL builder"
        size="large"
      >
        <v-icon size="22">mdi-map-search-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-btn-toggle v-model="kind" mandatory density="compact" class="mb-2" divided>
        <v-btn value="search" size="small">Search</v-btn>
        <v-btn value="dir" size="small">Directions</v-btn>
        <v-btn value="pin" size="small">Coords</v-btn>
      </v-btn-toggle>

      <template v-if="kind === 'search'">
        <v-text-field v-model="query" label="Place / address" density="compact" variant="outlined" hide-details class="mb-2" />
      </template>
      <template v-else-if="kind === 'dir'">
        <v-text-field v-model="origin" label="Origin" density="compact" variant="outlined" hide-details class="mb-2" />
        <v-text-field v-model="destination" label="Destination" density="compact" variant="outlined" hide-details class="mb-2" />
      </template>
      <template v-else>
        <div class="d-flex gap-8 mb-2">
          <v-text-field v-model.number="lat" type="number" label="Latitude" density="compact" variant="outlined" hide-details step="0.000001" />
          <v-text-field v-model.number="lng" type="number" label="Longitude" density="compact" variant="outlined" hide-details step="0.000001" />
        </div>
      </template>

      <div class="url-out mb-2">
        <div class="url-out__value">{{ url }}</div>
      </div>
      <div class="d-flex align-center gap-8">
        <v-btn size="small" variant="tonal" color="primary" :href="url" target="_blank" rel="noopener">
          <v-icon start size="16">mdi-open-in-new</v-icon>
          Open
        </v-btn>
        <v-spacer />
        <v-btn size="small" variant="text" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const kind = ref<'search' | 'dir' | 'pin'>('search')
const query = ref('Golden Gate Bridge')
const origin = ref('')
const destination = ref('')
const lat = ref(37.7749)
const lng = ref(-122.4194)
const notify = useNotificationStore()

const url = computed(() => {
  if (kind.value === 'search') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.value)}`
  }
  if (kind.value === 'dir') {
    const q = `origin=${encodeURIComponent(origin.value)}&destination=${encodeURIComponent(destination.value)}`
    return `https://www.google.com/maps/dir/?api=1&${q}`
  }
  return `https://www.google.com/maps?q=${lat.value},${lng.value}`
})

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    notify.showToast({
      type: 'success',
      title: 'Maps URL copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.url-out {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.url-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  word-break: break-all;
}

.gap-8 {
  gap: 8px;
}
</style>
