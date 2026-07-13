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
        :title="`Bookmarks (${bookmarks.length})`"
        size="large"
      >
        <v-icon size="22" :color="alreadyBookmarked ? 'primary' : undefined">
          {{ alreadyBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex align-center mb-2">
        <span class="text-subtitle-2 flex-grow-1">Bookmarks</span>
        <v-btn
          v-if="!alreadyBookmarked"
          size="small"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-plus"
          @click="addCurrent"
        >
          Add this page
        </v-btn>
        <v-btn
          v-else
          size="small"
          variant="text"
          color="error"
          prepend-icon="mdi-bookmark-remove"
          @click="removeCurrent"
        >
          Remove
        </v-btn>
      </div>

      <div class="bm-list">
        <div v-if="!bookmarks.length" class="text-caption text-medium-emphasis pa-2">
          No bookmarks yet.
        </div>
        <div v-for="b in bookmarks" :key="b.id" class="bm-row">
          <button class="bm-link" :title="b.path" @click="go(b.path)">
            <v-icon size="14" class="bm-icon">mdi-bookmark</v-icon>
            <span class="bm-title">{{ b.title }}</span>
            <span class="bm-path">{{ b.path }}</span>
          </button>
          <v-btn size="x-small" variant="text" @click="removeBookmark(b.id)">
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addBookmark, bookmarks, removeBookmark } from '../utils/bookmarks'

const open = ref(false)
const route = useRoute()
const router = useRouter()

const currentTitle = computed(() => {
  const meta = route.meta.title
  if (typeof meta === 'string') return meta
  const seg = route.path.split('/').filter(Boolean).pop() || 'Home'
  return seg.charAt(0).toUpperCase() + seg.slice(1)
})

const alreadyBookmarked = computed(() =>
  bookmarks.value.some((b) => b.path === route.fullPath),
)

function addCurrent() {
  addBookmark(route.fullPath, currentTitle.value)
}

function removeCurrent() {
  const existing = bookmarks.value.find((b) => b.path === route.fullPath)
  if (existing) removeBookmark(existing.id)
}

function go(path: string) {
  if (route.fullPath !== path) router.push(path)
  open.value = false
}
</script>

<style scoped>
.bm-list {
  max-height: 260px;
  overflow-y: auto;
}

.bm-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bm-link {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  min-width: 0;
}

.bm-link:hover {
  background: rgba(148, 163, 184, 0.08);
}

.bm-icon {
  color: #2563EB !important;
  flex-shrink: 0;
}

.bm-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.bm-path {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  margin-left: auto;
}
</style>
