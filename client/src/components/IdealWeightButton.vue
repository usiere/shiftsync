<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Ideal weight"
        size="large"
      >
        <v-icon size="22">mdi-weight-kilogram</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Ideal Weight</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="height" type="number" label="Height cm" density="compact" variant="outlined" hide-details min="0" />
        <v-select v-model="sex" :items="['Male','Female']" density="compact" variant="outlined" hide-details label="Sex" style="max-width: 100px;" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="iw-row">
          <div class="iw-col">
            <div class="iw-label">Devine</div>
            <div class="iw-val">{{ devine }} kg</div>
          </div>
          <div class="iw-col">
            <div class="iw-label">Robinson</div>
            <div class="iw-val">{{ robinson }} kg</div>
          </div>
        </div>
        <div class="iw-row">
          <div class="iw-col">
            <div class="iw-label">Miller</div>
            <div class="iw-val">{{ miller }} kg</div>
          </div>
          <div class="iw-col">
            <div class="iw-label">Hamwi</div>
            <div class="iw-val">{{ hamwi }} kg</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const height = ref<number>(175)
const sex = ref<string>('Male')

const error = computed(() => {
  const h = Number(height.value)
  if (!Number.isFinite(h) || h <= 0) return 'Height must be > 0'
  if (h < 152) return 'Formulas assume ≥ 152 cm (60")'
  return ''
})

const inchesOver5 = computed(() => (Number(height.value) - 152.4) / 2.54)

const male = computed(() => sex.value === 'Male')

const devine = computed(() => round((male.value ? 50 : 45.5) + 2.3 * inchesOver5.value))
const robinson = computed(() => round((male.value ? 52 : 49) + (male.value ? 1.9 : 1.7) * inchesOver5.value))
const miller = computed(() => round((male.value ? 56.2 : 53.1) + (male.value ? 1.41 : 1.36) * inchesOver5.value))
const hamwi = computed(() => round((male.value ? 48 : 45.5) + (male.value ? 2.7 : 2.2) * inchesOver5.value))

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.iw-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.iw-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.iw-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.iw-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
