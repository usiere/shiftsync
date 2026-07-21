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
        title="Vim cheat sheet"
        size="large"
      >
        <v-icon size="22">mdi-vim</v-icon>
      </v-btn>
    </template>

    <v-card min-width="380" class="pa-3">
      <v-text-field
        v-model="query"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="Search…"
        prepend-inner-icon="mdi-magnify"
        class="mb-2"
      />
      <div class="vim-list">
        <div v-for="section in filtered" :key="section.name" class="mb-2">
          <div class="vim-section">{{ section.name }}</div>
          <div v-for="c in section.entries" :key="c.cmd" class="vim-row">
            <code class="vim-key">{{ c.cmd }}</code>
            <span class="vim-desc">{{ c.desc }}</span>
          </div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Entry {
  cmd: string
  desc: string
}

interface Section {
  name: string
  entries: Entry[]
}

const open = ref(false)
const query = ref('')

const SECTIONS: Section[] = [
  {
    name: 'Motion',
    entries: [
      { cmd: 'h j k l', desc: 'Left, down, up, right' },
      { cmd: 'w / b', desc: 'Word forward / back' },
      { cmd: '0 / $', desc: 'Line start / end' },
      { cmd: 'gg / G', desc: 'File start / end' },
      { cmd: '{ / }', desc: 'Paragraph back / forward' },
      { cmd: 'Ctrl-d / u', desc: 'Half page down / up' },
    ],
  },
  {
    name: 'Editing',
    entries: [
      { cmd: 'i / a', desc: 'Insert before / after cursor' },
      { cmd: 'o / O', desc: 'New line below / above' },
      { cmd: 'x', desc: 'Delete char' },
      { cmd: 'dd', desc: 'Delete line' },
      { cmd: 'yy', desc: 'Yank line' },
      { cmd: 'p / P', desc: 'Paste after / before' },
      { cmd: 'u / Ctrl-r', desc: 'Undo / redo' },
    ],
  },
  {
    name: 'Search',
    entries: [
      { cmd: '/pat', desc: 'Search forward' },
      { cmd: '?pat', desc: 'Search backward' },
      { cmd: 'n / N', desc: 'Next / previous match' },
      { cmd: ':%s/a/b/g', desc: 'Replace all a → b' },
    ],
  },
  {
    name: 'Files',
    entries: [
      { cmd: ':w', desc: 'Write file' },
      { cmd: ':q', desc: 'Quit' },
      { cmd: ':wq / ZZ', desc: 'Write & quit' },
      { cmd: ':q!', desc: 'Quit without saving' },
      { cmd: ':e path', desc: 'Open file' },
    ],
  },
  {
    name: 'Visual',
    entries: [
      { cmd: 'v', desc: 'Visual mode' },
      { cmd: 'V', desc: 'Line visual mode' },
      { cmd: 'Ctrl-v', desc: 'Block visual mode' },
      { cmd: 'gv', desc: 'Reselect last selection' },
    ],
  },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return SECTIONS
  return SECTIONS.map((s) => ({
    ...s,
    entries: s.entries.filter(
      (e) => e.cmd.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q),
    ),
  })).filter((s) => s.entries.length)
})
</script>

<style scoped>
.vim-list {
  max-height: 320px;
  overflow-y: auto;
}

.vim-section {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 0 2px;
}

.vim-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.vim-key {
  width: 110px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 1px 6px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 3px;
  white-space: nowrap;
}

.vim-desc {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #64748B;
}
</style>
