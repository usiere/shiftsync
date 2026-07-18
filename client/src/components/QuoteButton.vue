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
        title="Random quote"
        size="large"
      >
        <v-icon size="22">mdi-format-quote-close</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="quote-text">"{{ current.text }}"</div>
      <div class="quote-author">— {{ current.author }}</div>
      <div class="d-flex mt-3">
        <v-btn size="small" variant="text" @click="pick">
          <v-icon start size="16">mdi-refresh</v-icon>
          Another
        </v-btn>
        <v-spacer />
        <v-btn size="small" variant="text" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface Quote {
  text: string
  author: string
}

const open = ref(false)
const current = ref<Quote>({ text: '', author: '' })
const notify = useNotificationStore()

const QUOTES: Quote[] = [
  { text: 'The best way out is always through.', author: 'Robert Frost' },
  { text: 'What we think, we become.', author: 'Buddha' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso' },
  { text: 'The journey of a thousand miles begins with one step.', author: 'Lao Tzu' },
  { text: 'Stay hungry, stay foolish.', author: 'Stewart Brand' },
  { text: 'What gets measured gets managed.', author: 'Peter Drucker' },
  { text: 'Perfect is the enemy of good.', author: 'Voltaire' },
  { text: 'Any sufficiently advanced technology is indistinguishable from magic.', author: 'Arthur C. Clarke' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
]

function pick() {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  const idx = bytes[0] % QUOTES.length
  current.value = QUOTES[idx]
}

async function copy() {
  try {
    await navigator.clipboard.writeText(`"${current.value.text}" — ${current.value.author}`)
    notify.showToast({
      type: 'success',
      title: 'Quote copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}

onMounted(pick)

watch(open, (v) => {
  if (v && !current.value.text) pick()
})
</script>

<style scoped>
.quote-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-style: italic;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface));
}

.quote-author {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94A3B8;
  text-align: right;
  margin-top: 6px;
}
</style>
