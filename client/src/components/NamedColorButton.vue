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
        title="Named color lookup"
        size="large"
      >
        <v-icon size="22">mdi-palette</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex align-center gap-8 mb-2">
        <input type="color" v-model="hex" class="nc-color" />
        <v-text-field
          v-model="hex"
          density="compact"
          variant="outlined"
          hide-details
          class="flex-grow-1"
        />
      </div>
      <div class="nc-match">
        <div class="nc-swatch" :style="{ background: hex }" />
        <div class="nc-info">
          <div class="nc-name">{{ nearest.name }}</div>
          <div class="nc-hex text-caption text-medium-emphasis">
            {{ nearest.hex }} · Δ {{ nearest.distance.toFixed(0) }}
          </div>
        </div>
        <v-btn size="small" variant="text" @click="copyName">Copy name</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const hex = ref('#2563EB')
const notify = useNotificationStore()

const NAMED: Array<[string, string]> = [
  ['aliceblue','#F0F8FF'], ['antiquewhite','#FAEBD7'], ['aqua','#00FFFF'],
  ['aquamarine','#7FFFD4'], ['azure','#F0FFFF'], ['beige','#F5F5DC'],
  ['bisque','#FFE4C4'], ['black','#000000'], ['blanchedalmond','#FFEBCD'],
  ['blue','#0000FF'], ['blueviolet','#8A2BE2'], ['brown','#A52A2A'],
  ['burlywood','#DEB887'], ['cadetblue','#5F9EA0'], ['chartreuse','#7FFF00'],
  ['chocolate','#D2691E'], ['coral','#FF7F50'], ['cornflowerblue','#6495ED'],
  ['crimson','#DC143C'], ['cyan','#00FFFF'], ['darkblue','#00008B'],
  ['darkcyan','#008B8B'], ['darkgoldenrod','#B8860B'], ['darkgray','#A9A9A9'],
  ['darkgreen','#006400'], ['darkkhaki','#BDB76B'], ['darkmagenta','#8B008B'],
  ['darkolivegreen','#556B2F'], ['darkorange','#FF8C00'], ['darkorchid','#9932CC'],
  ['darkred','#8B0000'], ['darksalmon','#E9967A'], ['darkseagreen','#8FBC8F'],
  ['darkslateblue','#483D8B'], ['darkslategray','#2F4F4F'], ['darkturquoise','#00CED1'],
  ['darkviolet','#9400D3'], ['deeppink','#FF1493'], ['deepskyblue','#00BFFF'],
  ['dimgray','#696969'], ['dodgerblue','#1E90FF'], ['firebrick','#B22222'],
  ['forestgreen','#228B22'], ['fuchsia','#FF00FF'], ['gainsboro','#DCDCDC'],
  ['gold','#FFD700'], ['goldenrod','#DAA520'], ['gray','#808080'],
  ['green','#008000'], ['hotpink','#FF69B4'], ['indianred','#CD5C5C'],
  ['indigo','#4B0082'], ['ivory','#FFFFF0'], ['khaki','#F0E68C'],
  ['lavender','#E6E6FA'], ['lightblue','#ADD8E6'], ['lightcoral','#F08080'],
  ['lightgray','#D3D3D3'], ['lightgreen','#90EE90'], ['lightpink','#FFB6C1'],
  ['lightsalmon','#FFA07A'], ['lightseagreen','#20B2AA'], ['lightskyblue','#87CEFA'],
  ['lime','#00FF00'], ['limegreen','#32CD32'], ['magenta','#FF00FF'],
  ['maroon','#800000'], ['mediumaquamarine','#66CDAA'], ['mediumblue','#0000CD'],
  ['mediumorchid','#BA55D3'], ['mediumpurple','#9370DB'], ['mediumseagreen','#3CB371'],
  ['midnightblue','#191970'], ['navy','#000080'], ['olive','#808000'],
  ['orange','#FFA500'], ['orangered','#FF4500'], ['orchid','#DA70D6'],
  ['peru','#CD853F'], ['pink','#FFC0CB'], ['plum','#DDA0DD'],
  ['purple','#800080'], ['red','#FF0000'], ['royalblue','#4169E1'],
  ['saddlebrown','#8B4513'], ['salmon','#FA8072'], ['seagreen','#2E8B57'],
  ['sienna','#A0522D'], ['silver','#C0C0C0'], ['skyblue','#87CEEB'],
  ['slateblue','#6A5ACD'], ['slategray','#708090'], ['snow','#FFFAFA'],
  ['springgreen','#00FF7F'], ['steelblue','#4682B4'], ['tan','#D2B48C'],
  ['teal','#008080'], ['thistle','#D8BFD8'], ['tomato','#FF6347'],
  ['turquoise','#40E0D0'], ['violet','#EE82EE'], ['wheat','#F5DEB3'],
  ['white','#FFFFFF'], ['yellow','#FFFF00'], ['yellowgreen','#9ACD32'],
]

function hexToRgb(h: string): [number, number, number] {
  const clean = h.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ]
}

const nearest = computed(() => {
  const [r, g, b] = hexToRgb(hex.value)
  let best = NAMED[0]
  let bestDist = Number.POSITIVE_INFINITY
  for (const [name, h] of NAMED) {
    const [nr, ng, nb] = hexToRgb(h)
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2
    if (d < bestDist) {
      bestDist = d
      best = [name, h]
    }
  }
  return { name: best[0], hex: best[1], distance: Math.sqrt(bestDist) }
})

async function copyName() {
  try {
    await navigator.clipboard.writeText(nearest.value.name)
    notify.showToast({
      type: 'success',
      title: 'Color name copied',
      message: nearest.value.name,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.nc-color {
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.nc-match {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.nc-swatch {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.nc-info {
  flex: 1;
}

.nc-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
}

.nc-hex {
  font-family: 'DM Mono', monospace;
}

.gap-8 {
  gap: 8px;
}
</style>
