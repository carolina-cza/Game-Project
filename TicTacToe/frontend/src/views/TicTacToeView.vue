<template>
  <main class="pt-8 text-center">
    <h1 class="mb-8 text-3xl font-bold uppercase">Tic Tac Toe</h1>

    <div class="player-info mb-6">
      <p class="text-xl">Du bist: 
        <span :class="{'text-pink-500': currentPlayer === 'X', 'text-blue-400': currentPlayer === 'O'}">
          {{ currentPlayer === 'X' ? '✕' : '○' }}
        </span>
      </p>
      <p class="text-xl mt-2" :class="{'text-green-400': isMyTurn, 'text-red-400': !isMyTurn}">
        {{ isMyTurn ? 'Du bist dran!' : 'Gegner ist dran!' }}
      </p>
    </div>

    <div class="flex flex-col items-center mb-8">
      <div 
        v-for="(row, x) in board" 
        :key="x"
        class="flex">
        <div 
          v-for="(cell, y) in row" 
          :key="y" 
          @click="MakeMove(x, y)" 
          :class="`
            border border-white w-24 h-24 flex items-center justify-center 
            material-icons-outlined text-4xl 
            ${!isMyTurn || cell ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}
            ${cell === 'X' ? 'text-pink-500' : 'text-blue-400'}
          `">
          {{ cell === 'X' ? 'close' : cell === 'O' ? 'circle' : '' }}
        </div>
      </div>
    </div>

    <div class="text-center">
      <h2 v-if="winner" class="text-6xl font-bold mb-8">
        {{ winner === currentPlayer ? 'Du hast gewonnen!' : 'Gegner hat gewonnen!' }}
      </h2>
      <button 
        @click="ResetGame" 
        class="px-4 py-2 bg-pink-500 rounded uppercase font-bold hover:bg-pink-600 duration-300">
        Neues Spiel
      </button>
    </div>
  </main>
</template>

<script setup>

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')
const route = useRoute()
const router = useRouter()

const currentPlayer = ref('') // wird durch URL parameter gesetzt
const currentTurn = ref('X') // wer ist gerade dran
const board = ref([
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
])

// Berechnet, ob der aktuelle Spieler am Zug ist
const isMyTurn = computed(() => currentPlayer.value === currentTurn.value)

const winner = computed(() => {
  const flatBoard = board.value.flat()
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertikal
    [0, 4, 8], [2, 4, 6] // diagonal
  ]

  for (let line of lines) {
    const [a, b, c] = line
    if (flatBoard[a] && flatBoard[a] === flatBoard[b] && flatBoard[a] === flatBoard[c]) {
      return flatBoard[a]
    }
  }
  return null
})

const MakeMove = (x, y) => {
  if (!isMyTurn.value || winner.value || board.value[x][y]) return

  socket.emit('makeMove', {
    x, 
    y,
    player: currentPlayer.value,
    gameId: route.query.gameId
  })
}

const ResetGame = () => {
  socket.emit('resetGame', route.query.gameId)
}

onMounted(() => {
  // Spieler-Typ (X oder O) aus URL holen
  const playerType = route.query.player
  const gameId = route.query.gameId
  
  if (!playerType || !gameId) {
    router.push('/')
    return
  }
  
  currentPlayer.value = playerType
  
  // Dem Spiel als spezifischer Spieler beitreten
  socket.emit('playerJoined', {
    gameId,
    player: playerType
  });
  
  // Auf Spielstandaktualisierungen hören
  socket.on('gameState', (gameState) => {
    console.log('Received game state:', gameState);
    board.value = gameState.board;
    currentTurn.value = gameState.currentTurn;
  });
})
</script>

<style scoped>
.player-info {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
}
</style>
  
<style>
  #tictactoe {
    text-align: center;
    margin: 23px;
    padding: 23px;
  }
  #board {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
  #board div {
    width: 100px;
    height: 100px;
    background-color: white;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    cursor: pointer;
  }
</style>
  