<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Birthstone by month"
        size="large"
      >
        <v-icon size="22">mdi-diamond-stone</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Birthstone</div>
      <v-select
        v-model="month"
        :items="monthNames"
        density="compact"
        variant="outlined"
        hide-details
        label="Month"
      />
      <div class="bs-card">
        <div class="bs-swatch" :style="{ background: entry.color }"></div>
        <div class="bs-body">
          <div class="bs-name">{{ entry.stone }}</div>
          <div class="bs-flower">Flower: {{ entry.flower }}</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DATA: { stone: string; color: string; flower: string }[] = [
  { stone: 'Garnet',       color: '#7F1D1D', flower: 'Carnation' },
  { stone: 'Amethyst',     color: '#7C3AED', flower: 'Violet' },
  { stone: 'Aquamarine',   color: '#67E8F9', flower: 'Daffodil' },
  { stone: 'Diamond',      color: '#E5E7EB', flower: 'Daisy' },
  { stone: 'Emerald',      color: '#065F46', flower: 'Lily of the valley' },
  { stone: 'Pearl',        color: '#F3E8FF', flower: 'Rose' },
  { stone: 'Ruby',         color: '#B91C1C', flower: 'Larkspur' },
  { stone: 'Peridot',      color: '#84CC16', flower: 'Gladiolus' },
  { stone: 'Sapphire',     color: '#1E40AF', flower: 'Aster' },
  { stone: 'Opal',         color: '#F0ABFC', flower: 'Marigold' },
  { stone: 'Topaz',        color: '#EAB308', flower: 'Chrysanthemum' },
  { stone: 'Turquoise',    color: '#14B8A6', flower: 'Narcissus' },
]

const month = ref<string>(monthNames[new Date().getMonth()])

const entry = computed(() => DATA[monthNames.indexOf(month.value)] || DATA[0])
</script>

<style scoped>
.bs-card {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
}

.bs-swatch {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.35);
}

.bs-body {
  flex: 1;
}

.bs-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #0F172A;
}

.bs-flower {
  margin-top: 2px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
