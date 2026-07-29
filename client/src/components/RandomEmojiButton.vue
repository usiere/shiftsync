<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random emoji"
        size="large"
      >
        <v-icon size="22">mdi-emoticon-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Random emoji</div>
      <div class="re-out">
        <span v-for="(e, i) in picks" :key="i" class="re-emoji">{{ e }}</span>
        <span v-if="!picks.length" class="text-caption text-medium-emphasis">Click roll.</span>
      </div>
      <div class="d-flex gap-8 mt-3 justify-center">
        <v-text-field v-model.number="count" type="number" label="How many" density="compact" variant="outlined" hide-details min="1" max="30" style="max-width: 120px" />
        <v-btn color="primary" size="small" @click="roll">
          <v-icon start size="16">mdi-refresh</v-icon>
          Roll
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗',
  '🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜',
  '🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩',
  '🥺','😰','😱','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥸','🤓',
  '🧐','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤',
  '🦄','🐝','🦋','🐢','🐍','🐙','🦑','🦞','🦀','🐳','🐬','🐟','🐠','🦈','🍎','🍊','🍋','🍌','🍉','🍇',
  '🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🌽','🌶️','🥒','🥕','🌭','🍔','🍟','🍕',
  '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🎯','🎲','🧩','🎮','🎰','🎬','🎨','🎭','🎧','🎤','🎸',
  '🚀','🛸','🌈','⭐','🌟','✨','⚡','☀️','☁️','☔','❄️','🔥','💧','🌊','🎁','🎉','🎊','💯','💥','💫',
]

const count = ref<number>(5)
const picks = ref<string[]>([])

function roll() {
  const n = Math.max(1, Math.min(30, Math.floor(count.value) || 1))
  const buf = new Uint32Array(n)
  crypto.getRandomValues(buf)
  picks.value = Array.from(buf, (v) => EMOJIS[v % EMOJIS.length])
}
</script>

<style scoped>
.gap-8 { gap: 8px; }

.re-out {
  min-height: 64px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
  font-size: 26px;
  line-height: 1;
}

.re-emoji {
  display: inline-block;
}
</style>
