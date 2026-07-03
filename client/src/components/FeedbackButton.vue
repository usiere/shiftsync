<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Send feedback"
    size="large"
    @click="open = true"
  >
    <v-icon size="22">mdi-message-text-outline</v-icon>
  </v-btn>

  <v-dialog v-model="open" max-width="480">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" size="20">mdi-message-text-outline</v-icon>
        Send feedback
      </v-card-title>
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-2">
          What would you like to tell us? We'll copy your note to the clipboard so
          you can paste it into Slack or an email.
        </div>
        <v-select
          v-model="category"
          :items="categories"
          label="Category"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-3"
        />
        <v-textarea
          v-model="message"
          label="Your feedback"
          density="compact"
          variant="outlined"
          rows="4"
          :maxlength="500"
          counter
          autofocus
          hide-details="auto"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!canSubmit"
          @click="submit"
        >
          Copy & close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const category = ref<'bug' | 'idea' | 'praise' | 'other'>('idea')
const message = ref('')
const route = useRoute()
const notify = useNotificationStore()

const categories = [
  { title: 'Idea / suggestion', value: 'idea' },
  { title: 'Bug report', value: 'bug' },
  { title: 'Praise', value: 'praise' },
  { title: 'Other', value: 'other' },
]

const canSubmit = computed(() => message.value.trim().length > 0)

watch(open, (v) => {
  if (!v) {
    message.value = ''
    category.value = 'idea'
  }
})

function cancel() {
  open.value = false
}

async function submit() {
  if (!canSubmit.value) return
  const payload = [
    `Category: ${category.value}`,
    `Page: ${route.fullPath}`,
    `Time: ${new Date().toISOString()}`,
    '',
    message.value.trim(),
  ].join('\n')

  try {
    await navigator.clipboard.writeText(payload)
    notify.showToast({
      type: 'success',
      title: 'Feedback copied',
      message: 'Paste it into Slack or email to share it with the team.',
    })
  } catch {
    notify.showToast({
      type: 'warning',
      title: 'Copy failed',
      message: 'Could not copy to clipboard — try again.',
    })
  }
  open.value = false
}
</script>
