<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Blood type compatibility"
        size="large"
      >
        <v-icon size="22">mdi-water-alert-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Blood Type</div>
      <v-select
        v-model="type"
        :items="TYPES"
        density="compact"
        variant="outlined"
        hide-details
        label="Type"
      />
      <div class="bt-row">
        <div class="bt-col">
          <div class="bt-label">Can donate to</div>
          <div class="bt-val">{{ donateTo.join(', ') }}</div>
        </div>
      </div>
      <div class="bt-row">
        <div class="bt-col">
          <div class="bt-label">Can receive from</div>
          <div class="bt-val">{{ receiveFrom.join(', ') }}</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

const type = ref<string>('O+')

const DONATE: Record<string, string[]> = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
}

const donateTo = computed(() => DONATE[type.value] || [])
const receiveFrom = computed(() => TYPES.filter(t => (DONATE[t] || []).includes(type.value)))
</script>

<style scoped>
.bt-row {
  display: flex;
  margin-top: 8px;
}

.bt-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
}

.bt-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 4px;
}

.bt-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
