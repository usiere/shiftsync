<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Big text banner"
    size="large"
    @click="dialog = true"
  >
    <v-icon size="22">mdi-message-alert-outline</v-icon>
  </v-btn>

  <v-dialog v-model="dialog" fullscreen transition="fade-transition">
    <div class="big-text-stage" @click="dialog = false">
      <div v-if="!editing" class="big-text" :style="{ color }" @click.stop="editing = true">
        {{ message || 'Click to type' }}
      </div>
      <div v-else class="big-text-editor" @click.stop>
        <textarea
          v-model="message"
          class="big-text-input"
          :style="{ color }"
          rows="1"
          autofocus
          @blur="editing = false"
          @keydown.enter.prevent="editing = false"
        />
      </div>

      <div class="big-text-toolbar" @click.stop>
        <input v-model="color" type="color" class="big-text-color" />
        <v-btn size="small" variant="tonal" @click="editing = !editing">
          {{ editing ? 'Done' : 'Edit' }}
        </v-btn>
        <v-btn size="small" variant="tonal" color="error" @click="dialog = false">
          Close
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialog = ref(false)
const editing = ref(false)
const message = ref('Hello')
const color = ref('#2563EB')
</script>

<style scoped>
.big-text-stage {
  position: fixed;
  inset: 0;
  background: #0F172A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.big-text {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(3rem, 18vw, 20rem);
  font-weight: 800;
  text-align: center;
  line-height: 1.05;
  padding: 24px;
  word-break: break-word;
  user-select: none;
}

.big-text-editor {
  padding: 24px;
  width: 100%;
  text-align: center;
}

.big-text-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(2rem, 10vw, 12rem);
  font-weight: 800;
  text-align: center;
  line-height: 1.1;
}

.big-text-toolbar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 6px 10px;
  z-index: 10;
}

.big-text-color {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}
</style>
