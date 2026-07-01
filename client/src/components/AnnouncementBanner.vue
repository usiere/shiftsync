<template>
  <transition name="slide-down">
    <div
      v-if="announcement"
      class="announcement"
      :class="`announcement--${announcement.variant ?? 'info'}`"
      role="status"
    >
      <v-icon size="18" class="announcement__icon">{{ iconFor(announcement.variant) }}</v-icon>
      <div class="announcement__body">
        <span class="announcement__title">{{ announcement.title }}</span>
        <span class="announcement__message">{{ announcement.message }}</span>
      </div>
      <a
        v-if="announcement.actionLabel && announcement.actionHref"
        class="announcement__action"
        :href="announcement.actionHref"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ announcement.actionLabel }}
      </a>
      <button
        class="announcement__dismiss"
        title="Dismiss"
        aria-label="Dismiss announcement"
        @click="dismiss"
      >
        <v-icon size="16">mdi-close</v-icon>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { activeAnnouncement, dismissAnnouncement } from '../utils/announcements'

const announcement = activeAnnouncement

function iconFor(variant?: string): string {
  switch (variant) {
    case 'warning':
      return 'mdi-alert-outline'
    case 'success':
      return 'mdi-check-circle-outline'
    default:
      return 'mdi-information-outline'
  }
}

function dismiss() {
  if (announcement.value) dismissAnnouncement(announcement.value.id)
}
</script>

<style scoped>
.announcement {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px 0;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  border: 1px solid transparent;
}

.announcement--info {
  background: #EFF6FF;
  color: #1E40AF;
  border-color: #BFDBFE;
}
.announcement--info .announcement__icon {
  color: #2563EB !important;
}

.announcement--warning {
  background: #FFFBEB;
  color: #92400E;
  border-color: #FDE68A;
}
.announcement--warning .announcement__icon {
  color: #B45309 !important;
}

.announcement--success {
  background: #ECFDF5;
  color: #047857;
  border-color: #A7F3D0;
}
.announcement--success .announcement__icon {
  color: #059669 !important;
}

.announcement__body {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  flex: 1;
  min-width: 0;
}

.announcement__title {
  font-weight: 700;
}

.announcement__message {
  opacity: 0.9;
}

.announcement__action {
  font-weight: 600;
  text-decoration: underline;
  color: inherit;
  white-space: nowrap;
}

.announcement__dismiss {
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 120ms ease, background 120ms ease;
}

.announcement__dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.04);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
