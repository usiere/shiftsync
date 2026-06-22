<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-2">Help & FAQ</h1>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Quick answers to the most common ShiftSync questions.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search help topics…"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="mb-4"
        />

        <v-card v-for="cat in filteredCategories" :key="cat.title" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2" :color="cat.color">{{ cat.icon }}</v-icon>
            {{ cat.title }}
          </v-card-title>
          <v-divider />
          <v-expansion-panels variant="accordion" flat>
            <v-expansion-panel
              v-for="item in cat.items"
              :key="item.q"
            >
              <v-expansion-panel-title>{{ item.q }}</v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-body-2 faq-answer" v-html="item.a" />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>

        <v-alert
          v-if="filteredCategories.length === 0"
          type="info"
          variant="tonal"
        >
          No help topics match "{{ search }}". Try a different keyword.
        </v-alert>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-lifebuoy</v-icon>
            Still stuck?
          </v-card-title>
          <v-divider />
          <v-card-text>
            <p class="text-body-2 mb-3">
              Can't find what you need? Reach out to our support team
              and we'll get back to you within one business day.
            </p>
            <v-btn
              variant="tonal"
              color="primary"
              block
              prepend-icon="mdi-email"
              href="mailto:support@shiftsync.com"
              class="mb-2"
            >
              support@shiftsync.com
            </v-btn>
            <v-btn
              variant="outlined"
              block
              prepend-icon="mdi-book-open-variant"
              href="https://github.com/usiere/shiftsync"
              target="_blank"
              rel="noopener"
            >
              View on GitHub
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-information-outline</v-icon>
            About
          </v-card-title>
          <v-divider />
          <v-card-text class="text-body-2">
            <div class="mb-1"><strong>App:</strong> ShiftSync</div>
            <div class="mb-1"><strong>Version:</strong> 1.0.0</div>
            <div><strong>Tech:</strong> Vue 3, Vuetify, Prisma</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface FaqItem { q: string; a: string }
interface FaqCategory {
  title: string
  icon: string
  color: string
  items: FaqItem[]
}

const search = ref('')

const CATEGORIES: FaqCategory[] = [
  {
    title: 'Getting started',
    icon: 'mdi-rocket-launch',
    color: 'primary',
    items: [
      {
        q: 'How do I sign in?',
        a: 'Use the email and password you were given by your admin. If you forgot your password, contact your manager — password resets are admin-initiated.'
      },
      {
        q: 'What roles exist and what can each do?',
        a: '<strong>Admin</strong> manages all locations and users. <strong>Manager</strong> manages shifts, schedules and swaps for their location. <strong>Staff</strong> can view their schedule, request time off and submit swap requests.'
      },
      {
        q: 'Can I use ShiftSync on mobile?',
        a: 'Yes — the app is fully responsive. For frequent on-the-go use, save it as a home-screen shortcut from your phone browser.'
      }
    ]
  },
  {
    title: 'Schedule & shifts',
    icon: 'mdi-calendar-clock',
    color: 'info',
    items: [
      {
        q: 'How do I view my upcoming shifts?',
        a: 'Open the <strong>Schedule</strong> tab. Your assigned shifts are highlighted on the week grid. Click any shift to see start/end time, role and location.'
      },
      {
        q: 'Why can\'t I be assigned to a shift?',
        a: 'Common reasons: you\'re marked unavailable for that slot, you\'d exceed weekly hour limits, the shift requires a certification you don\'t have, or you have approved time-off overlapping the shift.'
      },
      {
        q: 'What is a "desired hours" preference?',
        a: 'Desired hours is a <em>soft</em> preference used by the auto-scheduler. Availability is a <em>hard</em> constraint — desired hours just tries to keep you close to that weekly target.'
      }
    ]
  },
  {
    title: 'Swap requests',
    icon: 'mdi-swap-horizontal',
    color: 'warning',
    items: [
      {
        q: 'How do I swap a shift?',
        a: 'Go to <strong>Swap Requests</strong> → New Swap. Pick the shift you want to give up and an eligible coworker. They accept, then a manager approves.'
      },
      {
        q: 'Why was my swap auto-cancelled?',
        a: 'If a manager edits the underlying shift after a swap is approved (time, role, location), the swap is automatically cancelled and both parties are notified.'
      },
      {
        q: 'Can I drop a shift without a replacement?',
        a: 'Yes — use the "drop" flow. It posts the shift to the swap board for any eligible coworker to claim.'
      }
    ]
  },
  {
    title: 'Time off',
    icon: 'mdi-beach',
    color: 'success',
    items: [
      {
        q: 'How do I request time off?',
        a: 'Open <strong>Time Off</strong> → New Request. Pick a date range and a reason. Your manager will be notified and approve or deny it.'
      },
      {
        q: 'How far in advance should I request time off?',
        a: 'At least 14 days. Shorter notice is allowed but may be rejected if it leaves a shift uncovered.'
      }
    ]
  },
  {
    title: 'Notifications & settings',
    icon: 'mdi-bell-cog',
    color: 'secondary',
    items: [
      {
        q: 'How do I turn off email notifications?',
        a: 'Go to <strong>Settings</strong> → Notification preferences and toggle off the channels you don\'t want.'
      },
      {
        q: 'How do I switch between light and dark mode?',
        a: 'Click the sun/moon icon in the top bar. Your choice is remembered next time you sign in.'
      },
      {
        q: 'Is there a keyboard shortcut to navigate?',
        a: 'Yes — press <strong>⌘K</strong> (or Ctrl+K) anywhere to open the command palette. Press <strong>?</strong> to see the full shortcut list.'
      }
    ]
  }
]

const filteredCategories = computed<FaqCategory[]>(() => {
  const q = (search.value || '').trim().toLowerCase()
  if (!q) return CATEGORIES
  return CATEGORIES
    .map(cat => ({
      ...cat,
      items: cat.items.filter(i =>
        i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
      )
    }))
    .filter(cat => cat.items.length > 0)
})
</script>

<style scoped>
.faq-answer :deep(strong) {
  font-weight: 600;
}

.faq-answer :deep(em) {
  font-style: italic;
}
</style>
