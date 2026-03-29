import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const counter = ref(0)

  function incrementCounter() {
    counter.value++
  }

  function decrementCounter() {
    counter.value--
  }

  return {
    counter,
    incrementCounter,
    decrementCounter
  }
})