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
        title="Slug generator"
        size="large"
      >
        <v-icon size="22">mdi-link-plus</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        placeholder="e.g. Hello World! 2026"
        class="mb-2"
      />
      <div class="d-flex gap-8 mb-2">
        <v-select
          v-model="separator"
          :items="[
            { title: '- (hyphen)', value: '-' },
            { title: '_ (underscore)', value: '_' },
            { title: '. (dot)', value: '.' },
          ]"
          label="Separator"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-checkbox v-model="lower" density="compact" hide-details label="Lowercase" />
      </div>
      <div class="slug-out mb-2">
        <div class="slug-out__value">{{ slug || '—' }}</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!slug" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const separator = ref('-')
const lower = ref(true)
const notify = useNotificationStore()

const slug = computed(() => {
  let s = input.value.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  if (lower.value) s = s.toLowerCase()
  s = s.replace(/[^a-zA-Z0-9\s-]/g, '')
  s = s.replace(/\s+/g, separator.value)
  s = s.replace(new RegExp(`\\${separator.value}+`, 'g'), separator.value)
  return s.replace(new RegExp(`^\\${separator.value}|\\${separator.value}$`, 'g'), '')
})

async function copy() {
  if (!slug.value) return
  try {
    await navigator.clipboard.writeText(slug.value)
    notify.showToast({
      type: 'success',
      title: 'Slug copied',
      message: slug.value,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.slug-out {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.slug-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
}

.gap-8 {
  gap: 8px;
}
</style>
