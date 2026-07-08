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
        title="Emoji picker"
        size="large"
      >
        <v-icon size="22">mdi-emoticon-outline</v-icon>
      </v-btn>
    </template>

    <v-card class="pa-2 emoji-card" min-width="280">
      <div class="text-caption text-medium-emphasis px-1 mb-2">
        Click any emoji to copy it
      </div>
      <div v-for="group in groups" :key="group.name" class="mb-2">
        <div class="text-caption text-medium-emphasis px-1 mb-1">
          {{ group.name }}
        </div>
        <div class="emoji-grid">
          <button
            v-for="e in group.list"
            :key="`${group.name}-${e}`"
            class="emoji-btn"
            :title="`Copy ${e}`"
            @click="copy(e)"
          >
            {{ e }}
          </button>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const notify = useNotificationStore()

const groups = [
  {
    name: 'Reactions',
    list: ['👍', '👎', '❤️', '🎉', '👏', '🙌', '🙏', '🔥', '💯', '✅', '❌', '⚠️'],
  },
  {
    name: 'Smileys',
    list: ['😀', '😄', '😅', '😂', '🙂', '😉', '😊', '😎', '🤔', '😴', '😢', '😡'],
  },
  {
    name: 'Work',
    list: ['📅', '📆', '📊', '📈', '📌', '📎', '📝', '📞', '💼', '☕', '🕐', '⏰'],
  },
]

async function copy(emoji: string) {
  try {
    await navigator.clipboard.writeText(emoji)
    notify.showToast({
      type: 'success',
      title: `${emoji} copied`,
      message: 'Paste it anywhere.',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.emoji-card {
  max-height: 360px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
}

.emoji-btn {
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 6px 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 120ms ease;
}

.emoji-btn:hover {
  background: rgba(148, 163, 184, 0.15);
}
</style>
