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
        title="Password strength meter"
        size="large"
      >
        <v-icon size="22">mdi-shield-lock-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-text-field
        v-model="password"
        :type="show ? 'text' : 'password'"
        label="Password"
        density="compact"
        variant="outlined"
        hide-details
        :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="show = !show"
        class="mb-3"
      />

      <div class="strength-bar">
        <div
          v-for="i in 4"
          :key="i"
          class="strength-seg"
          :class="{
            [`strength-seg--filled-${score.tier}`]: i <= score.filled,
          }"
        />
      </div>
      <div class="d-flex align-center mt-1">
        <span class="strength-label" :class="`strength-label--${score.tier}`">
          {{ score.label }}
        </span>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">~{{ crackTime }} to crack</span>
      </div>

      <div class="checks mt-3">
        <div v-for="c in checks" :key="c.label" class="check-row" :class="{ 'check-row--ok': c.ok }">
          <v-icon size="14" class="check-icon">
            {{ c.ok ? 'mdi-check-circle' : 'mdi-circle-outline' }}
          </v-icon>
          <span>{{ c.label }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const password = ref('')
const show = ref(false)

const checks = computed(() => {
  const p = password.value
  return [
    { label: '≥ 12 characters', ok: p.length >= 12 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(p) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(p) },
    { label: 'Digit', ok: /\d/.test(p) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(p) },
    { label: 'No repeated char runs', ok: p.length > 0 && !/(.)\1{2,}/.test(p) },
  ]
})

function alphabetSize(p: string): number {
  let n = 0
  if (/[a-z]/.test(p)) n += 26
  if (/[A-Z]/.test(p)) n += 26
  if (/\d/.test(p)) n += 10
  if (/[^A-Za-z0-9]/.test(p)) n += 32
  return n || 1
}

interface Score {
  filled: number
  tier: 'weak' | 'fair' | 'good' | 'strong'
  label: string
  bits: number
}

const score = computed<Score>(() => {
  const p = password.value
  if (!p) return { filled: 0, tier: 'weak', label: 'Empty', bits: 0 }
  const bits = Math.log2(alphabetSize(p)) * p.length
  let filled = 1
  let tier: Score['tier'] = 'weak'
  let label = 'Weak'
  if (bits >= 90) { filled = 4; tier = 'strong'; label = 'Strong' }
  else if (bits >= 60) { filled = 3; tier = 'good'; label = 'Good' }
  else if (bits >= 40) { filled = 2; tier = 'fair'; label = 'Fair' }
  return { filled, tier, label, bits }
})

const crackTime = computed(() => {
  const guesses = Math.pow(2, Math.max(0, score.value.bits - 1))
  const perSecond = 1e11
  const seconds = guesses / perSecond
  if (seconds < 1) return 'instantly'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h`
  if (seconds < 31_536_000) return `${Math.round(seconds / 86_400)}d`
  const years = seconds / 31_536_000
  if (years < 1000) return `${Math.round(years)}y`
  return 'centuries'
})
</script>

<style scoped>
.strength-bar {
  display: flex;
  gap: 4px;
}

.strength-seg {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(148, 163, 184, 0.2);
}

.strength-seg--filled-weak { background: #DC2626; }
.strength-seg--filled-fair { background: #F59E0B; }
.strength-seg--filled-good { background: #3B82F6; }
.strength-seg--filled-strong { background: #16A34A; }

.strength-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
}

.strength-label--weak { color: #DC2626; }
.strength-label--fair { color: #F59E0B; }
.strength-label--good { color: #3B82F6; }
.strength-label--strong { color: #16A34A; }

.checks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
}

.check-row--ok {
  color: #16A34A;
}

.check-icon {
  color: currentColor !important;
}
</style>
