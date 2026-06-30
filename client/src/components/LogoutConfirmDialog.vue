<template>
  <v-dialog v-model="open" max-width="380">
    <v-card class="logout-card">
      <div class="logout-card__icon">
        <v-icon size="28" color="error">mdi-logout</v-icon>
      </div>
      <v-card-title class="logout-card__title">Sign out?</v-card-title>
      <v-card-text class="logout-card__text">
        You'll need to sign back in to view your schedule and notifications.
      </v-card-text>
      <v-card-actions class="logout-card__actions">
        <v-btn variant="text" @click="open = false">Cancel</v-btn>
        <v-spacer />
        <v-btn color="error" variant="flat" @click="confirm">Sign out</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const emit = defineEmits<{ (e: 'confirm'): void }>()

function show() {
  open.value = true
}

function confirm() {
  open.value = false
  emit('confirm')
}

defineExpose({ show })
</script>

<style scoped>
.logout-card {
  border-radius: 14px;
  padding: 8px 4px 4px;
}

.logout-card__icon {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.logout-card__title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  padding-top: 8px;
}

.logout-card__text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 4px 24px 8px;
}

.logout-card__actions {
  padding: 8px 16px 16px;
}
</style>
