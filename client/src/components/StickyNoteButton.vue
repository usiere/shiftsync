<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="hasNote ? 'Open sticky note (saved)' : 'Open sticky note'"
    size="large"
    @click="open = true"
  >
    <v-icon size="22" :color="hasNote ? 'primary' : undefined">
      {{ hasNote ? 'mdi-note-text' : 'mdi-note-text-outline' }}
    </v-icon>
  </v-btn>

  <v-dialog v-model="open" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" size="20">mdi-note-text-outline</v-icon>
        Sticky note
        <v-spacer />
        <span class="text-caption text-medium-emphasis">saved locally</span>
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="stickyNote"
          placeholder="Jot something down…"
          density="compact"
          variant="outlined"
          rows="6"
          :maxlength="1000"
          counter
          autofocus
          hide-details="auto"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="error" :disabled="!hasNote" @click="clear">
          Clear
        </v-btn>
        <v-spacer />
        <v-btn color="primary" @click="open = false">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { clearStickyNote, stickyNote } from '../utils/stickyNote'

const open = ref(false)
const hasNote = computed(() => stickyNote.value.trim().length > 0)

function clear() {
  clearStickyNote()
}
</script>
