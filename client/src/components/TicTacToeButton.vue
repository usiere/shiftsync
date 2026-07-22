<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Tic-tac-toe"
        size="large"
      >
        <v-icon size="22">mdi-tic-tac-toe</v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Tic-tac-toe</div>
      <div class="ttt-grid">
        <button
          v-for="(cell, i) in board"
          :key="i"
          class="ttt-cell"
          :class="{ 'ttt-cell--x': cell === 'X', 'ttt-cell--o': cell === 'O' }"
          :disabled="!!cell || finished"
          @click="playHuman(i)"
        >
          {{ cell }}
        </button>
      </div>
      <div class="ttt-status mt-2" :class="statusClass">{{ statusLabel }}</div>
      <v-btn size="small" variant="text" class="mt-2" @click="reset">
        <v-icon start size="14">mdi-refresh</v-icon>
        New game
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Cell = 'X' | 'O' | ''
const board = ref<Cell[]>(Array(9).fill(''))
const finished = computed(() => !!winner.value || board.value.every(Boolean))

const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function findWinner(cells: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a]
  }
  return ''
}

const winner = computed(() => findWinner(board.value))

const statusLabel = computed(() => {
  if (winner.value === 'X') return 'You win!'
  if (winner.value === 'O') return 'CPU wins!'
  if (board.value.every(Boolean)) return 'Tie'
  return 'Your turn (X)'
})

const statusClass = computed(() => {
  if (winner.value === 'X') return 'ttt-status--win'
  if (winner.value === 'O') return 'ttt-status--lose'
  if (board.value.every(Boolean)) return 'ttt-status--tie'
  return ''
})

function playHuman(i: number) {
  if (board.value[i] || finished.value) return
  board.value[i] = 'X'
  if (finished.value) return
  cpuTurn()
}

function cpuTurn() {
  // Try win, then block, then center, then corner, then random
  const cells = [...board.value]
  const empty = cells.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0)

  for (const i of empty) {
    const t = [...cells]; t[i] = 'O'
    if (findWinner(t) === 'O') { board.value[i] = 'O'; return }
  }
  for (const i of empty) {
    const t = [...cells]; t[i] = 'X'
    if (findWinner(t) === 'X') { board.value[i] = 'O'; return }
  }
  if (empty.includes(4)) { board.value[4] = 'O'; return }
  const corners = [0, 2, 6, 8].filter((i) => empty.includes(i))
  if (corners.length) {
    const bytes = new Uint8Array(1)
    crypto.getRandomValues(bytes)
    board.value[corners[bytes[0] % corners.length]] = 'O'
    return
  }
  if (empty.length) {
    const bytes = new Uint8Array(1)
    crypto.getRandomValues(bytes)
    board.value[empty[bytes[0] % empty.length]] = 'O'
  }
}

function reset() {
  board.value = Array(9).fill('')
}
</script>

<style scoped>
.ttt-grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  gap: 4px;
  justify-content: center;
}

.ttt-cell {
  width: 60px;
  height: 60px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
  transition: background 120ms ease;
}

.ttt-cell:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.08);
}

.ttt-cell:disabled {
  cursor: not-allowed;
}

.ttt-cell--x { color: #2563EB; }
.ttt-cell--o { color: #DC2626; }

.ttt-status {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.ttt-status--win { color: #16A34A; }
.ttt-status--lose { color: #DC2626; }
.ttt-status--tie { color: #B45309; }
</style>
