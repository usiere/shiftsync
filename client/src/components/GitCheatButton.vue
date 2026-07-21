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
        title="Git cheat sheet"
        size="large"
      >
        <v-icon size="22">mdi-git</v-icon>
      </v-btn>
    </template>

    <v-card min-width="400" class="pa-3">
      <v-text-field
        v-model="query"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="Search…"
        prepend-inner-icon="mdi-magnify"
        class="mb-2"
      />
      <div class="git-list">
        <div v-for="section in filtered" :key="section.name" class="mb-2">
          <div class="git-section">{{ section.name }}</div>
          <div v-for="c in section.entries" :key="c.cmd" class="git-row">
            <code class="git-cmd">{{ c.cmd }}</code>
            <span class="git-desc">{{ c.desc }}</span>
            <v-btn size="x-small" variant="text" @click="copy(c.cmd)">
              <v-icon size="14">mdi-content-copy</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface Entry { cmd: string; desc: string }
interface Section { name: string; entries: Entry[] }

const open = ref(false)
const query = ref('')
const notify = useNotificationStore()

const SECTIONS: Section[] = [
  {
    name: 'Setup',
    entries: [
      { cmd: 'git init', desc: 'Initialize new repo' },
      { cmd: 'git clone <url>', desc: 'Clone a remote' },
      { cmd: 'git remote -v', desc: 'List remotes' },
    ],
  },
  {
    name: 'Working',
    entries: [
      { cmd: 'git status', desc: 'Status of working tree' },
      { cmd: 'git add <path>', desc: 'Stage changes' },
      { cmd: 'git restore <path>', desc: 'Discard local changes' },
      { cmd: 'git commit -m "..."', desc: 'Commit staged changes' },
      { cmd: 'git diff', desc: 'Unstaged diff' },
      { cmd: 'git diff --staged', desc: 'Staged diff' },
    ],
  },
  {
    name: 'Branches',
    entries: [
      { cmd: 'git branch', desc: 'List branches' },
      { cmd: 'git switch -c feat/x', desc: 'New branch' },
      { cmd: 'git switch main', desc: 'Switch branch' },
      { cmd: 'git merge <branch>', desc: 'Merge branch in' },
      { cmd: 'git rebase main', desc: 'Rebase onto main' },
    ],
  },
  {
    name: 'History',
    entries: [
      { cmd: 'git log --oneline -20', desc: 'Compact log' },
      { cmd: 'git blame <file>', desc: 'Line-by-line authorship' },
      { cmd: 'git reflog', desc: 'Reference history' },
    ],
  },
  {
    name: 'Sync',
    entries: [
      { cmd: 'git fetch', desc: 'Fetch remote refs' },
      { cmd: 'git pull --rebase', desc: 'Pull with rebase' },
      { cmd: 'git push', desc: 'Push to remote' },
      { cmd: 'git push -u origin HEAD', desc: 'Push and set upstream' },
    ],
  },
  {
    name: 'Undo',
    entries: [
      { cmd: 'git reset --soft HEAD~1', desc: 'Uncommit last, keep staged' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Discard last commit' },
      { cmd: 'git revert <sha>', desc: 'Create inverse commit' },
      { cmd: 'git stash', desc: 'Stash working tree' },
      { cmd: 'git stash pop', desc: 'Restore stash' },
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

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Command copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.git-list {
  max-height: 340px;
  overflow-y: auto;
}

.git-section {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 0 2px;
}

.git-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.git-cmd {
  width: 180px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 1px 6px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.git-desc {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #64748B;
}
</style>
