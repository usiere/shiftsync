<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="rulerEnabled ? 'Hide screen ruler' : 'Show screen ruler'"
    size="large"
    @click="toggleRuler"
  >
    <v-icon size="22" :color="rulerEnabled ? 'primary' : undefined">
      mdi-ruler
    </v-icon>
  </v-btn>

  <Teleport to="body">
    <template v-if="rulerEnabled">
      <div class="ruler ruler--top" aria-hidden="true">
        <div
          v-for="i in xTicks"
          :key="`x${i}`"
          class="ruler__tick ruler__tick--x"
          :class="{ 'ruler__tick--major': i % 100 === 0 }"
          :style="{ left: i + 'px' }"
        >
          <span v-if="i % 100 === 0">{{ i }}</span>
        </div>
      </div>
      <div class="ruler ruler--left" aria-hidden="true">
        <div
          v-for="i in yTicks"
          :key="`y${i}`"
          class="ruler__tick ruler__tick--y"
          :class="{ 'ruler__tick--major': i % 100 === 0 }"
          :style="{ top: i + 'px' }"
        >
          <span v-if="i % 100 === 0">{{ i }}</span>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { rulerEnabled, toggleRuler } from '../utils/rulerOverlay'

const w = ref(window.innerWidth)
const h = ref(window.innerHeight)

function onResize() {
  w.value = window.innerWidth
  h.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

const xTicks = computed(() => {
  const out: number[] = []
  for (let i = 0; i <= w.value; i += 10) out.push(i)
  return out
})

const yTicks = computed(() => {
  const out: number[] = []
  for (let i = 0; i <= h.value; i += 10) out.push(i)
  return out
})
</script>

<style scoped>
.ruler {
  position: fixed;
  z-index: 9994;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.55);
  color: #F1F5F9;
}

.ruler--top {
  top: 0;
  left: 0;
  right: 0;
  height: 18px;
}

.ruler--left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 18px;
}

.ruler__tick {
  position: absolute;
  background: rgba(241, 245, 249, 0.55);
}

.ruler__tick--x {
  top: 0;
  width: 1px;
  height: 6px;
}

.ruler__tick--y {
  left: 0;
  width: 6px;
  height: 1px;
}

.ruler__tick--major {
  background: #F1F5F9;
}

.ruler__tick--x.ruler__tick--major {
  height: 12px;
}

.ruler__tick--y.ruler__tick--major {
  width: 12px;
}

.ruler__tick span {
  position: absolute;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  padding-left: 2px;
  top: 8px;
  left: 2px;
  white-space: nowrap;
}

.ruler__tick--y span {
  top: -6px;
  left: 8px;
}
</style>
