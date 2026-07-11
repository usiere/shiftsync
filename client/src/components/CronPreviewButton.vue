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
        title="Cron expression preview"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-four-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <v-text-field
        v-model="expr"
        label="Cron expression (5 fields)"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="e.g. */15 9-17 * * 1-5"
        class="mb-2"
      />

      <div v-if="error" class="text-error text-body-2">{{ error }}</div>
      <template v-else>
        <div class="cron-humanized mb-2">{{ humanized }}</div>
        <div class="cron-parts">
          <div v-for="p in parts" :key="p.name" class="cron-part">
            <span class="cron-part__name">{{ p.name }}</span>
            <code class="cron-part__value">{{ p.value }}</code>
            <span class="cron-part__desc">{{ p.desc }}</span>
          </div>
        </div>
      </template>
      <v-divider class="my-2" />
      <div class="text-caption text-medium-emphasis">Examples</div>
      <div class="cron-examples">
        <button
          v-for="ex in examples"
          :key="ex"
          class="cron-example"
          @click="expr = ex"
        >
          {{ ex }}
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const expr = ref('*/15 9-17 * * 1-5')

const examples = ['* * * * *', '0 * * * *', '0 9 * * *', '*/15 * * * *', '0 0 * * 0']

interface Field {
  name: string
  min: number
  max: number
  labels?: string[]
}

const FIELDS: Field[] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12, labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  { name: 'day of week', min: 0, max: 6, labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] },
]

interface Parsed {
  raw: string
  desc: string
}

function describeField(field: Field, raw: string): string {
  if (raw === '*') return `every ${field.name}`
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((r) => describeField(field, r))
      .join(' and ')
  }
  const stepMatch = raw.match(/^(.+)\/(\d+)$/)
  if (stepMatch) {
    const base = stepMatch[1] === '*' ? `every ${field.name}` : describeField(field, stepMatch[1])
    return `${base} every ${stepMatch[2]}`
  }
  const rangeMatch = raw.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    const a = Number(rangeMatch[1])
    const b = Number(rangeMatch[2])
    return `${label(field, a)}–${label(field, b)}`
  }
  const n = Number(raw)
  if (Number.isFinite(n) && n >= field.min && n <= field.max) return label(field, n)
  throw new Error(`Invalid ${field.name}: ${raw}`)
}

function label(field: Field, value: number): string {
  if (field.labels) return field.labels[value - field.min] ?? String(value)
  return String(value)
}

const parsedFields = computed<Parsed[] | null>(() => {
  const tokens = expr.value.trim().split(/\s+/)
  if (tokens.length !== 5) return null
  return tokens.map((t, i) => ({ raw: t, desc: describeField(FIELDS[i], t) }))
})

const error = ref('')

const parts = computed(() => {
  error.value = ''
  try {
    const p = parsedFields.value
    if (!p) {
      error.value = 'Expected 5 fields'
      return []
    }
    return FIELDS.map((f, i) => ({
      name: f.name,
      value: p[i].raw,
      desc: p[i].desc,
    }))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid cron'
    return []
  }
})

const humanized = computed(() => {
  if (!parts.value.length) return ''
  const [mi, hr, dom, mon, dow] = parts.value
  return [
    `At ${hr.desc}:${mi.desc}`,
    `on ${dow.desc}`,
    `— day ${dom.desc} of ${mon.desc}`,
  ].join(', ')
})
</script>

<style scoped>
.cron-humanized {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.08);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #1E40AF;
}

.cron-parts {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cron-part {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.cron-part__name {
  width: 92px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 10px;
}

.cron-part__value {
  min-width: 60px;
  font-family: 'DM Mono', monospace;
  padding: 1px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 3px;
}

.cron-part__desc {
  color: #64748B;
}

.cron-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.cron-example {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
}

.cron-example:hover {
  background: rgba(148, 163, 184, 0.12);
}
</style>
