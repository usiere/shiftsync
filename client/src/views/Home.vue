<template>
  <div class="home">
    <h1>ShiftSync Client</h1>
    <p>Welcome to the client application!</p>
    <button @click="incrementCounter">Count: {{ counter }}</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
const { counter } = counterStore
const { incrementCounter } = counterStore
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #369870;
}
</style>