<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Note frequency"
        size="large"
      >
        <v-icon size="22">mdi-music-note</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Note Frequency</div>
      <div class="d-flex" style="gap: 6px;">
        <v-select v-model="note" :items="NOTES" density="compact" variant="outlined" hide-details label="Note" />
        <v-text-field v-model.number="octave" type="number" label="Octave" density="compact" variant="outlined" hide-details min="-1" max="9" style="max-width: 90px;" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="nf-badge">{{ hz }} Hz</div>
        <div class="nf-row">
          <div class="nf-col">
            <div class="nf-label">MIDI #</div>
            <div class="nf-val">{{ midi }}</div>
          </div>
          <div class="nf-col">
            <div class="nf-label">Wavelength</div>
            <div class="nf-val">{{ wavelength }} m</div>
          </div>
        </div>
        <div class="nf-note">A4 = 440 Hz · equal temperament</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const note = ref<string>('A')
const octave = ref<number>(4)

const error = computed(() => {
  const o = Number(octave.value)
  if (!Number.isInteger(o) || o < -1 || o > 9) return 'Octave must be -1 to 9'
  return ''
})

const midi = computed(() => {
  const idx = NOTES.indexOf(note.value)
  if (idx < 0) return 0
  return (Number(octave.value) + 1) * 12 + idx
})

const hz = computed(() => round(440 * Math.pow(2, (midi.value - 69) / 12)))
const wavelength = computed(() => round(343 / hz.value))

function round(v: number) {
  if (v === 0) return 0
  if (Math.abs(v) < 0.01) return v.toExponential(3)
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.nf-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  background: #F3E8FF;
  color: #6B21A8;
}

.nf-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.nf-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.nf-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.nf-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.nf-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
