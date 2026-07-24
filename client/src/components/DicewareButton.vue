<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Diceware passphrase generator"
        size="large"
      >
        <v-icon size="22">mdi-dice-6-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Diceware passphrase</div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="count"
          type="number"
          label="Words"
          density="compact"
          variant="outlined"
          hide-details
          min="3"
          max="12"
        />
        <v-select
          v-model="sep"
          :items="[' ', '-', '_', '.']"
          label="Separator"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>
      <div class="dw-out mb-2">
        <span v-if="phrase" class="dw-phrase">{{ phrase }}</span>
        <span v-else class="text-caption text-medium-emphasis">Click generate.</span>
      </div>
      <div class="text-caption text-medium-emphasis mb-2 text-center">
        ~{{ bits }} bits of entropy
      </div>
      <div class="d-flex gap-8">
        <v-btn color="primary" size="small" @click="generate">
          <v-icon start size="16">mdi-refresh</v-icon>
          Generate
        </v-btn>
        <v-btn size="small" variant="outlined" :disabled="!phrase" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          {{ copied ? 'Copied' : 'Copy' }}
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const WORDS = [
  'apple','anchor','arrow','angel','amber','album','arena','atlas',
  'bread','beach','brave','bloom','brick','bison','birch','bloom',
  'crown','cider','crane','coral','cloud','cabin','curve','crisp',
  'dream','drift','delta','depth','dusk','daisy','doubt','drape',
  'ember','earth','eagle','event','extra','elite','ember','erupt',
  'flame','frost','fable','forge','fable','flint','fjord','focus',
  'grove','gleam','globe','grace','glide','giant','gauge','graze',
  'haven','hover','harbor','hymn','honey','hedge','harsh','hazel',
  'ivory','image','index','ideal','inlet','ivory','issue','ionic',
  'jolly','jewel','jaunt','juror','joker','jewel','juice','jumbo',
  'karma','knack','krill','kayak','kite','knock','kudos','knead',
  'lunar','lyric','lodge','lemon','logic','latch','loom','laser',
  'maple','moss','magma','mango','moody','miner','muse','mesa',
  'noble','north','nudge','niche','nova','nudge','nylon','nadir',
  'ocean','onyx','orbit','opal','ounce','olive','oxide','opera',
  'piano','plume','pearl','pluck','prism','pouch','prism','pixel',
  'quest','quick','quilt','quirk','quiet','quill','quota','queue',
  'raven','river','rustic','realm','ridge','robin','rally','ranch',
  'stone','swift','snowy','stove','shard','solar','story','summit',
  'tulip','tiger','trove','tempo','tulip','tally','tonic','totem',
  'ultra','umber','unity','usher','usual','ultra','uncle','urban',
  'vivid','voyage','vault','venue','veil','viper','vigor','vocal',
  'water','willow','waltz','whim','wheat','wombat','woven','wispy',
  'xenon','xylem','xenon','xylem','xenon','xylem','xerox','xebec',
  'yodel','young','yield','yeast','yacht','yield','youth','yodel',
  'zesty','zebra','zephyr','zonal','zinc','zebra','zebra','zenith',
]

const count = ref<number>(5)
const sep = ref<string>('-')
const phrase = ref<string>('')
const copied = ref<boolean>(false)

const bits = computed(() => Math.round(Math.log2(WORDS.length) * (count.value || 0)))

function pickOne(): string {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return WORDS[buf[0] % WORDS.length]
}

function generate() {
  const n = Math.max(3, Math.min(12, Math.floor(count.value || 5)))
  const words: string[] = []
  for (let i = 0; i < n; i++) words.push(pickOne())
  phrase.value = words.join(sep.value)
  copied.value = false
}

async function copy() {
  try {
    await navigator.clipboard.writeText(phrase.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.gap-8 { gap: 8px; }

.dw-out {
  min-height: 44px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.dw-phrase {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 13px;
  word-break: break-all;
}
</style>
