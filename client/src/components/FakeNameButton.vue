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
        title="Fake profile generator"
        size="large"
      >
        <v-icon size="22">mdi-account-question-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="fake-rows">
        <div v-for="row in rows" :key="row.label" class="fake-row">
          <span class="fake-label">{{ row.label }}</span>
          <code class="fake-value">{{ row.value }}</code>
          <v-btn size="x-small" variant="text" @click="copy(row.value)">
            <v-icon size="14">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>
      <v-btn size="small" variant="tonal" color="primary" block class="mt-2" @click="regen">
        <v-icon start size="16">mdi-refresh</v-icon>
        Generate new
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const FIRST = [
  'Alex','Sam','Jordan','Taylor','Morgan','Casey','Jamie','Riley','Kai','Sky',
  'Robin','Cameron','Quinn','Charlie','Reese','Dakota','Elliot','Emerson',
  'Finley','Harper','Hayden','Rowan','Sage','Skyler',
]
const LAST = [
  'Rivera','Chen','Kowalski','Ahmed','Nakamura','Silva','O\'Brien','Gonzalez',
  'Fitzgerald','Kim','Patel','Anderson','Nguyen','Thompson','Ivanov','Weber',
  'Bailey','Foster','Griffin','Hughes','Jenkins','Marsh','Novak','Ortega',
]
const DOMAINS = ['example.com', 'mail.test', 'inbox.local', 'demo.io', 'sandbox.dev']
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Salem', 'Fairview', 'Madison']

const open = ref(false)
const seed = ref(0)
const notify = useNotificationStore()

function pick<T>(list: T[], salt: number): T {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return list[(bytes[0] + salt) % list.length]
}

const first = ref('')
const last = ref('')
const domain = ref('')
const city = ref('')
const phone = ref('')
const uuid = ref('')

function regen() {
  seed.value++
  first.value = pick(FIRST, seed.value)
  last.value = pick(LAST, seed.value * 2)
  domain.value = pick(DOMAINS, seed.value * 3)
  city.value = pick(CITIES, seed.value * 4)
  const bytes = new Uint16Array(1)
  crypto.getRandomValues(bytes)
  const num = String(1000000 + (bytes[0] % 9000000))
  phone.value = `+1-555-${num.slice(0, 3)}-${num.slice(3, 7)}`
  uuid.value = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : num
}

const email = computed(
  () => `${first.value.toLowerCase()}.${last.value.toLowerCase().replace(/'/g, '')}@${domain.value}`,
)

const rows = computed(() => [
  { label: 'Name', value: `${first.value} ${last.value}` },
  { label: 'Email', value: email.value },
  { label: 'Phone', value: phone.value },
  { label: 'City', value: city.value },
  { label: 'ID', value: uuid.value },
])

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}

onMounted(regen)

watch(open, (v) => {
  if (v && !first.value) regen()
})
</script>

<style scoped>
.fake-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fake-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fake-label {
  width: 50px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fake-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}
</style>
