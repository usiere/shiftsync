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
        title="HTTP status code lookup"
        size="large"
      >
        <v-icon size="22">mdi-web-check</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-text-field
        v-model="query"
        label="Status code or keyword"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="404 or not found"
        class="mb-2"
      />
      <div class="status-list">
        <div v-if="!results.length" class="text-caption text-medium-emphasis pa-2">
          No matches. Try 200, 404, or 5xx.
        </div>
        <div
          v-for="s in results"
          :key="s.code"
          class="status-row"
          :class="`status-row--${category(s.code)}`"
        >
          <div class="status-code">{{ s.code }}</div>
          <div class="status-body">
            <div class="status-name">{{ s.name }}</div>
            <div class="status-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Status {
  code: number
  name: string
  desc: string
}

const open = ref(false)
const query = ref('')

const STATUSES: Status[] = [
  { code: 100, name: 'Continue', desc: 'Client should send the rest of the request.' },
  { code: 101, name: 'Switching Protocols', desc: 'Server is switching protocols.' },
  { code: 200, name: 'OK', desc: 'Request succeeded.' },
  { code: 201, name: 'Created', desc: 'Resource was created.' },
  { code: 202, name: 'Accepted', desc: 'Request accepted for later processing.' },
  { code: 204, name: 'No Content', desc: 'Success with no response body.' },
  { code: 206, name: 'Partial Content', desc: 'Range request served.' },
  { code: 301, name: 'Moved Permanently', desc: 'Resource moved to a new URL.' },
  { code: 302, name: 'Found', desc: 'Temporary redirect.' },
  { code: 304, name: 'Not Modified', desc: 'Cached copy is still valid.' },
  { code: 307, name: 'Temporary Redirect', desc: 'Same method, temporary URL.' },
  { code: 308, name: 'Permanent Redirect', desc: 'Same method, permanent URL.' },
  { code: 400, name: 'Bad Request', desc: 'Malformed request.' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication required.' },
  { code: 403, name: 'Forbidden', desc: 'Server refuses despite valid auth.' },
  { code: 404, name: 'Not Found', desc: 'Resource does not exist.' },
  { code: 405, name: 'Method Not Allowed', desc: 'HTTP method not supported.' },
  { code: 408, name: 'Request Timeout', desc: 'Client took too long.' },
  { code: 409, name: 'Conflict', desc: 'State conflict prevents the change.' },
  { code: 410, name: 'Gone', desc: 'Resource permanently removed.' },
  { code: 418, name: "I'm a teapot", desc: 'RFC 2324 easter egg.' },
  { code: 422, name: 'Unprocessable Entity', desc: 'Semantic errors in payload.' },
  { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded.' },
  { code: 500, name: 'Internal Server Error', desc: 'Unexpected server condition.' },
  { code: 501, name: 'Not Implemented', desc: 'Server does not support method.' },
  { code: 502, name: 'Bad Gateway', desc: 'Upstream returned an invalid response.' },
  { code: 503, name: 'Service Unavailable', desc: 'Server temporarily overloaded.' },
  { code: 504, name: 'Gateway Timeout', desc: 'Upstream did not respond in time.' },
]

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return STATUSES
  return STATUSES.filter(
    (s) =>
      String(s.code).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q),
  )
})

function category(code: number): string {
  const c = Math.floor(code / 100)
  return `c${c}`
}
</script>

<style scoped>
.status-list {
  max-height: 260px;
  overflow-y: auto;
}

.status-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
}

.status-row:hover {
  background: rgba(148, 163, 184, 0.08);
}

.status-code {
  width: 40px;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 14px;
}

.status-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
}

.status-desc {
  font-size: 11px;
  color: #94A3B8;
}

.status-row--c1 .status-code { color: #6B7280; }
.status-row--c2 .status-code { color: #16A34A; }
.status-row--c3 .status-code { color: #2563EB; }
.status-row--c4 .status-code { color: #D97706; }
.status-row--c5 .status-code { color: #DC2626; }
</style>
