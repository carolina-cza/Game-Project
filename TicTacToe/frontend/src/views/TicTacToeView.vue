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
          {{ cell === 'X' ? 'X' : cell === 'O' ? 'O' : '' }}
        </div>
      </div>
    </div>

    <div class="text-center">
      <h2 v-if="winner" class="text-6xl font-bold mb-8">
        {{ winner === currentPlayer ? 'Du hast gewonnen!' : 'Gegner hat gewonnen!' }}
      </h2>
      <h2 v-if="isDraw" class="text-6xl font-bold mb-8">
        Unentschieden!
      </h2>
      <h2 v-if="opponentLeft" class="text-6xl font-bold mb-8">
        Gegner hat das Spiel verlassen - Du hast gewonnen!
      </h2>
      <div class="button-container flex justify-center gap-4">
        <template v-if="!opponentLeft">
          <button 
            @click="ResetGame" 
            class="px-4 py-2 bg-pink-500 rounded uppercase font-bold hover:bg-pink-600 duration-300">
            Neues Spiel
          </button>
        </template>
        <button 
          @click="goToMainMenu" 
          class="px-4 py-2 bg-gray-500 rounded uppercase font-bold hover:bg-gray-600 duration-300">
          Hauptmenü
        </button>
      </div>
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

const isMyTurn = computed(() => currentPlayer.value === currentTurn.value)

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

const ResetGame = () => {
  winner.value = null;
  opponentLeft.value = false;
  currentTurn.value = 'X';
  isDraw.value = false;
  board.value = [['', '', ''], ['', '', '']];

  socket.emit('resetGame', route.query.gameId);
}

const goToMainMenu = () => {
  socket.emit('playerLeft', {
    gameId: route.query.gameId,
    player: currentPlayer.value
  })
  socket.disconnect()
  router.push('/')
}

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
  
  socket.on('gameState', (gameState) => {
    board.value = gameState.board
    currentTurn.value = gameState.currentTurn
    winner.value = gameState.winner
    isDraw.value = gameState.isDraw
  })

  socket.on('playerLeft', () => {
    opponentLeft.value = true
  })

  socket.on('resetGame', () => {
    winner.value = null
    isDraw.value = false
    board.value = [['', '', ''], ['', '', ''], ['', '', '']]
    currentTurn.value = 'X'
  })
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
.player-info {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
}

.button-container {
  margin-top: 1rem;
}

.button-container button {
  min-width: 150px;
}
</style>
