<template>
  <div class="env-chip" :class="`env-chip--${env.key}`" :title="tooltip">
    <v-icon size="14" class="env-chip__icon">{{ env.icon }}</v-icon>
    <span class="env-chip__label">{{ env.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface EnvInfo {
  key: 'local' | 'dev' | 'staging' | 'prod'
  label: string
  icon: string
}

function detect(): EnvInfo {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
    return { key: 'local', label: 'LOCAL', icon: 'mdi-laptop' }
  }
  if (/(^|\.)dev\./.test(host) || host.startsWith('dev.') || host.endsWith('.dev')) {
    return { key: 'dev', label: 'DEV', icon: 'mdi-code-tags' }
  }
  if (/(^|\.)(staging|stage|preview|qa|test)\./.test(host) || host.endsWith('.staging')) {
    return { key: 'staging', label: 'STAGING', icon: 'mdi-flask-outline' }
  }
  return { key: 'prod', label: 'PROD', icon: 'mdi-server' }
}

const env = computed(detect)

const tooltip = computed(() => `Environment: ${env.value.label} · ${window.location.hostname}`)
</script>

<style scoped>
.env-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.env-chip__icon {
  color: #94A3B8 !important;
}

.env-chip--local {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1E40AF;
}

.env-chip--local .env-chip__icon { color: #2563EB !important; }

.env-chip--dev {
  background: #F5F3FF;
  border-color: #DDD6FE;
  color: #5B21B6;
}

.env-chip--dev .env-chip__icon { color: #7C3AED !important; }

.env-chip--staging {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.env-chip--staging .env-chip__icon { color: #B45309 !important; }

.env-chip--prod {
  background: #F0FDF4;
  border-color: #86EFAC;
  color: #166534;
}

.env-chip--prod .env-chip__icon { color: #16A34A !important; }

@media (max-width: 1100px) {
  .env-chip {
    display: none;
  }
}
</style>
