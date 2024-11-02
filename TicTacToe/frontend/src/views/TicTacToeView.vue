<template>
  <main class="pt-8 text-center">
    <!-- Display player information and current turn status -->
    <div class="player-info mb-6">
      <p class="text-xl">You are:
        <span :class="{ 'text-pink-500': currentPlayer === 'X', 'text-blue-400': currentPlayer === 'O' }">
          {{ currentPlayer === 'X' ? '✕' : '○' }}
        </span>
      </p>
      <p class="text-xl mt-2" :class="{ 'text-green-400': isMyTurn, 'text-red-400': !isMyTurn }">
        {{ isMyTurn ? 'Your turn!' : 'Opponent\'s turn!' }}
      </p>
    </div>

    <!-- Display the game board -->
    <div class="flex flex-col items-center mb-8">
      <div v-for="(row, x) in board" :key="x" class="flex">
        <div v-for="(cell, y) in row" :key="y" @click="MakeMove(x, y)" :class="`
            border border-white w-24 h-24 flex items-center justify-center 
            material-icons-outlined text-4xl 
            ${!isMyTurn || cell ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}
            ${cell === 'X' ? 'text-pink-500' : 'text-blue-400'}
          `">
          {{ cell === 'X' ? 'X' : cell === 'O' ? 'O' : '' }}
        </div>
      </div>
    </div>

    <!-- Display game status and action buttons -->
    <div class="text-center">
      <h2 v-if="winner" class="text-6xl font-bold mb-8">
        {{ winner === currentPlayer ? 'You won!' : 'Opponent won!' }}
      </h2>
      <h2 v-if="isDraw" class="text-6xl font-bold mb-8">
        Draw!
      </h2>
      <h3 v-if="opponentLeft" class="text-3xl font-bold mb-8">
        Opponent left the game - You won!
      </h3>
      <div class="button-container flex justify-center gap-4">
        <template v-if="!opponentLeft">
          <button @click="ResetGame"
            class="px-4 py-2 bg-pink-500 rounded uppercase font-bold hover:bg-pink-600 duration-300">
            New Game
          </button>
        </template>
        <button @click="goToMainMenu"
          class="px-4 py-2 bg-gray-500 rounded uppercase font-bold hover:bg-gray-600 duration-300">
          Main Menu
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import io from 'socket.io-client'

// Initialize socket connection
const socket = io('http://localhost:3001')
const route = useRoute()
const router = useRouter()

const currentPlayer = ref('')
const currentTurn = ref('X')
const opponentLeft = ref(false)
const winner = ref(null)
const isDraw = ref(false)
const board = ref([
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
])

// Determine if it's the current player's turn
const isMyTurn = computed(() => currentPlayer.value === currentTurn.value)

// Handle making a move
const MakeMove = (x, y) => {
  if (!isMyTurn.value || winner.value || board.value[x][y] !== '' || opponentLeft.value) {
    return
  }

  socket.emit('makeMove', {
    x,
    y,
    player: currentPlayer.value,
    gameId: route.query.gameId
  })
}

// Reset the game state
const ResetGame = () => {
  winner.value = null;
  opponentLeft.value = false;
  currentTurn.value = 'X';
  isDraw.value = false;
  board.value = [['', '', ''], ['', '', ''], ['', '', '']];

  socket.emit('resetGame', route.query.gameId);
}

// Navigate to the main menu
const goToMainMenu = () => {
  socket.emit('playerLeft', {
    gameId: route.query.gameId,
    player: currentPlayer.value
  })
  socket.disconnect()
  router.push('/')
}

// Handle component mount
onMounted(() => {
  const playerType = route.query.player
  const gameId = route.query.gameId

  if (!playerType || !gameId) {
    router.push('/')
    return
  }

  currentPlayer.value = playerType

  socket.emit('playerJoined', {
    gameId,
    player: playerType
  })

  // Update game state based on server events
  socket.on('gameState', (gameState) => {
    board.value = gameState.board
    currentTurn.value = gameState.currentTurn
    winner.value = gameState.winner
    isDraw.value = gameState.isDraw
  })

  // Handle opponent leaving the game
  socket.on('playerLeft', () => {
    opponentLeft.value = true
  })

  // Handle game reset
  socket.on('resetGame', () => {
    winner.value = null
    isDraw.value = false
    board.value = [['', '', ''], ['', '', ''], ['', '', '']]
    currentTurn.value = 'X'
  })
})

// Handle component unmount
onUnmounted(() => {
  socket.disconnect()
})
</script>
