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
        title="Roll dice"
        size="large"
      >
        <v-icon size="22">mdi-dice-multiple</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="d-flex align-center gap-8 mb-3">
        <span class="text-caption text-medium-emphasis">Dice</span>
        <v-select
          v-model="count"
          :items="[1, 2, 3, 4, 5, 6]"
          density="compact"
          variant="outlined"
          hide-details
          class="flex-grow-1"
        />
        <span class="text-caption text-medium-emphasis">Sides</span>
        <v-select
          v-model="sides"
          :items="[4, 6, 8, 10, 12, 20, 100]"
          density="compact"
          variant="outlined"
          hide-details
          class="flex-grow-1"
        />
      </div>

      <div class="dice-row mb-3">
        <span
          v-for="(v, i) in rolls"
          :key="i"
          class="dice-face"
          :class="{ 'dice-face--rolling': rolling }"
        >
          {{ v }}
        </span>
      </div>
      <div class="d-flex align-center">
        <div class="text-body-2 flex-grow-1">
          <span class="text-medium-emphasis">Total:</span>
          <strong class="ms-2">{{ total }}</strong>
        </div>
        <v-btn color="primary" size="small" @click="roll">
          <v-icon start size="16">mdi-dice-6</v-icon>
          Roll
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const open = ref(false)
const count = ref(2)
const sides = ref(6)
const rolls = ref<number[]>([])
const rolling = ref(false)

const total = computed(() => rolls.value.reduce((a, b) => a + b, 0))

function roll() {
  rolling.value = true
  const next: number[] = []
  const bytes = new Uint32Array(count.value)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < count.value; i++) {
    next.push((bytes[i] % sides.value) + 1)
  }
  rolls.value = next
  setTimeout(() => {
    rolling.value = false
  }, 250)
}

watch(open, (v) => {
  if (v && rolls.value.length === 0) roll()
})

watch([count, sides], () => {
  if (open.value) roll()
})
</script>

<style scoped>
.dice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
}

.dice-face {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 15px;
  font-weight: 600;
  background: rgba(148, 163, 184, 0.08);
  transition: transform 200ms ease;
}

.dice-face--rolling {
  animation: dice-shake 250ms ease;
}

@keyframes dice-shake {
  0% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg) scale(1.1); }
  100% { transform: rotate(0deg); }
}

.gap-8 {
  gap: 8px;
}
</style>
