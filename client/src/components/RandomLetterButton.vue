<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random letter"
        size="large"
      >
        <v-icon size="22">mdi-alphabetical-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Random letter</div>
      <div class="rl-letter">{{ letter || '?' }}</div>
      <v-select
        v-model="mode"
        :items="[
          { title: 'Uppercase A–Z', value: 'upper' },
          { title: 'Lowercase a–z', value: 'lower' },
          { title: 'Mixed case', value: 'mixed' },
          { title: 'Alphanumeric', value: 'alnum' },
        ]"
        density="compact"
        variant="outlined"
        hide-details
        class="mt-2 mb-2"
      />
      <v-btn color="primary" size="small" @click="pick">
        <v-icon start size="16">mdi-refresh</v-icon>
        Pick
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const mode = ref<'upper' | 'lower' | 'mixed' | 'alnum'>('upper')
const letter = ref<string>('')

const pool = computed(() => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  switch (mode.value) {
    case 'lower': return lower
    case 'mixed': return upper + lower
    case 'alnum': return upper + lower + digits
    default: return upper
  }
})

function pick() {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  const p = pool.value
  letter.value = p.charAt(buf[0] % p.length)
}
</script>

<style scoped>
.rl-letter {
  font-family: 'DM Mono', monospace;
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
  color: #1E40AF;
  background: rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  padding: 12px;
}
</style>
