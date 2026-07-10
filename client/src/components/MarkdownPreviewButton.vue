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
        title="Markdown preview"
        size="large"
      >
        <v-icon size="22">mdi-language-markdown</v-icon>
      </v-btn>
    </template>

    <v-card min-width="480" class="pa-3">
      <div class="d-flex gap-8">
        <v-textarea
          v-model="input"
          label="Markdown"
          density="compact"
          variant="outlined"
          rows="10"
          hide-details
          class="flex-grow-1"
        />
        <div class="md-preview flex-grow-1" v-html="html" />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref(
  '# Hello\n\n- **bold** and *italic*\n- `inline code`\n- [link](https://example.com)\n\n> A quote\n\n```\ncode block\n```',
)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderInline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  )
  return s
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inCode = false
  let listOpen = false

  const closeList = () => {
    if (listOpen) {
      out.push('</ul>')
      listOpen = false
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      closeList()
      if (!inCode) {
        out.push('<pre><code>')
        inCode = true
      } else {
        out.push('</code></pre>')
        inCode = false
      }
      continue
    }
    if (inCode) {
      out.push(escapeHtml(line))
      continue
    }
    if (/^#{1,6}\s/.test(line)) {
      closeList()
      const level = line.match(/^#+/)?.[0].length ?? 1
      const text = line.replace(/^#+\s*/, '')
      out.push(`<h${level}>${renderInline(text)}</h${level}>`)
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!listOpen) {
        out.push('<ul>')
        listOpen = true
      }
      const text = line.replace(/^\s*[-*]\s+/, '')
      out.push(`<li>${renderInline(text)}</li>`)
      continue
    }
    if (/^\s*>\s?/.test(line)) {
      closeList()
      const text = line.replace(/^\s*>\s?/, '')
      out.push(`<blockquote>${renderInline(text)}</blockquote>`)
      continue
    }
    if (line.trim() === '') {
      closeList()
      out.push('')
      continue
    }
    closeList()
    out.push(`<p>${renderInline(line)}</p>`)
  }

  closeList()
  if (inCode) out.push('</code></pre>')
  return out.join('\n')
}

const html = computed(() => renderMarkdown(input.value))
</script>

<style scoped>
.md-preview {
  max-width: 50%;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  max-height: 260px;
  overflow: auto;
}

.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  margin: 8px 0 4px;
  font-weight: 600;
}

.md-preview :deep(pre) {
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  overflow: auto;
}

.md-preview :deep(code) {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 1px 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

.md-preview :deep(blockquote) {
  margin: 4px 0;
  padding: 2px 8px;
  border-left: 3px solid #94A3B8;
  color: #64748B;
}

.md-preview :deep(a) {
  color: #2563EB;
}

.gap-8 {
  gap: 8px;
}
</style>
