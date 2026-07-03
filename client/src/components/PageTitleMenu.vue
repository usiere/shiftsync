<template>
  <v-menu offset="8" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        icon
        variant="text"
        class="me-2"
        title="Browser tab title"
        size="large"
        v-bind="props"
      >
        <v-icon size="22">mdi-tab</v-icon>
      </v-btn>
    </template>
    <v-card min-width="260" class="pa-3">
      <div class="text-caption mb-2 text-medium-emphasis">Tab title suffix</div>
      <v-text-field
        v-model="draft"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="e.g. Sprint 24"
        :maxlength="PAGE_TITLE_MAX"
        autofocus
        @keydown.enter="save"
      />
      <div class="d-flex align-center justify-end mt-3" style="gap: 6px">
        <v-btn
          variant="text"
          size="small"
          :disabled="!draft && !pageTitleSuffix"
          @click="clear"
        >
          Clear
        </v-btn>
        <v-btn color="primary" size="small" @click="save">Save</v-btn>
      </div>
      <div class="text-caption mt-2 text-medium-emphasis">
        Preview: {{ PAGE_TITLE_BASE }}{{ draft.trim() ? ` • ${draft.trim()}` : '' }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  PAGE_TITLE_BASE,
  PAGE_TITLE_MAX,
  clearPageTitleSuffix,
  pageTitleSuffix,
  setPageTitleSuffix,
} from '../utils/pageTitle'

const draft = ref<string>(pageTitleSuffix.value)

watch(pageTitleSuffix, (v) => {
  draft.value = v
})

function save() {
  setPageTitleSuffix(draft.value)
}

function clear() {
  draft.value = ''
  clearPageTitleSuffix()
}
</script>
