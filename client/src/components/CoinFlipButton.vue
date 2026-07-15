<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Flip a coin"
        size="large"
      >
        <v-icon size="22">mdi-circle-multiple-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-3">Coin flip</div>
      <div class="coin" :class="{ 'coin--flip': flipping }">
        <div class="coin__face">{{ face }}</div>
      </div>
      <div class="mt-3">
        <v-btn color="primary" size="small" @click="flip">
          <v-icon start size="16">mdi-refresh</v-icon>
          Flip
        </v-btn>
      </div>
      <div class="mt-2 text-caption text-medium-emphasis">
        Heads {{ heads }} · Tails {{ tails }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const face = ref<'Heads' | 'Tails' | '?'>('?')
const heads = ref(0)
const tails = ref(0)
const flipping = ref(false)

function flip() {
  flipping.value = true
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  const result: 'Heads' | 'Tails' = bytes[0] % 2 === 0 ? 'Heads' : 'Tails'
  setTimeout(() => {
    face.value = result
    if (result === 'Heads') heads.value++
    else tails.value++
    flipping.value = false
  }, 500)
}
</script>

<style scoped>
.coin {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #78350F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(120, 53, 15, 0.25);
  transition: transform 500ms cubic-bezier(0.5, 0, 0.5, 1);
}

.coin--flip {
  transform: rotateX(720deg);
}

.coin__face {
  transform: rotateX(180deg);
}

.coin--flip .coin__face {
  transform: none;
}
</style>
