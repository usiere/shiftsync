<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Vowel &amp; consonant counter"
        size="large"
      >
        <v-icon size="22">mdi-alpha-a-circle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Vowels &amp; consonants</div>
      <v-textarea
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        rows="3"
        no-resize
        class="mb-2"
      />
      <div class="vc-grid">
        <div class="vc-tile vc-tile--v">
          <div class="vc-count">{{ vowels }}</div>
          <div class="vc-label">vowels</div>
        </div>
        <div class="vc-tile vc-tile--c">
          <div class="vc-count">{{ consonants }}</div>
          <div class="vc-label">consonants</div>
        </div>
        <div class="vc-tile vc-tile--d">
          <div class="vc-count">{{ digits }}</div>
          <div class="vc-label">digits</div>
        </div>
        <div class="vc-tile vc-tile--o">
          <div class="vc-count">{{ other }}</div>
          <div class="vc-label">other</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')

const stats = computed(() => {
  let v = 0, c = 0, d = 0, o = 0
  for (const raw of text.value) {
    const ch = raw.toLowerCase()
    if (/[0-9]/.test(ch)) d++
    else if (/[a-z]/.test(ch)) {
      if ('aeiou'.includes(ch)) v++
      else c++
    } else if (/\S/.test(ch)) o++
  }
  return { v, c, d, o }
})

const vowels = computed(() => stats.value.v)
const consonants = computed(() => stats.value.c)
const digits = computed(() => stats.value.d)
const other = computed(() => stats.value.o)
</script>

<style scoped>
.vc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.vc-tile {
  padding: 8px;
  border-radius: 6px;
  text-align: center;
}

.vc-count {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
}

.vc-label {
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
}

.vc-tile--v { background: #EFF6FF; }
.vc-tile--v .vc-count { color: #1E40AF; }
.vc-tile--c { background: #DCFCE7; }
.vc-tile--c .vc-count { color: #166534; }
.vc-tile--d { background: #FEF3C7; }
.vc-tile--d .vc-count { color: #92400E; }
.vc-tile--o { background: rgba(148, 163, 184, 0.15); }
.vc-tile--o .vc-count { color: #475569; }
</style>
