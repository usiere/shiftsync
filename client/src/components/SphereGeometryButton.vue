<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Sphere volume &amp; surface"
        size="large"
      >
        <v-icon size="22">mdi-sphere</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Sphere</div>
      <v-text-field
        v-model.number="r"
        type="number"
        label="Radius r"
        density="compact"
        variant="outlined"
        hide-details
        min="0"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sp-row">
          <div class="sp-col">
            <div class="sp-label">Volume</div>
            <div class="sp-val">{{ volume }}</div>
          </div>
          <div class="sp-col">
            <div class="sp-label">Surface</div>
            <div class="sp-val">{{ surface }}</div>
          </div>
        </div>
        <div class="sp-note">V = 4⁄3 π r³ · A = 4 π r²</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r = ref<number>(5)

const error = computed(() => {
  const v = Number(r.value)
  if (!Number.isFinite(v) || v < 0) return 'Radius must be ≥ 0'
  return ''
})

const volume = computed(() => round((4 / 3) * Math.PI * Number(r.value) ** 3))
const surface = computed(() => round(4 * Math.PI * Number(r.value) ** 2))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.sp-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.sp-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.sp-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.sp-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.sp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
