<template>
    <div id='gameIdContainer'>
      <h1>Enter Game ID</h1>
      <div class="input-container">
        <div v-if="createdGameId" class="game-id-display">
          <p>Your Game ID: <span class="id-highlight">{{ createdGameId }}</span></p>
          <p class="info-text">Share this ID with your opponent</p>
          <button 
            @click="router.push(`/tictactoe?gameId=${createdGameId}&player=X`)"
            class="enter-button mt-4"
          >
            Start Game
          </button>
        </div>
        <template v-else>
          <input 
            v-model="gameId" 
            type="text" 
            placeholder="Enter your game ID..."
            class="game-id-input"
          >
          <div class="button-container">
            <button 
              @click="createNewGame"
              class="enter-button"
            >
              Create New Game
            </button>
            <button 
              @click="joinGame"
              :disabled="!gameId"
              class="enter-button"
            >
              Join Game
            </button>
            <router-link to="/">
              <button class="enter-button">
                Back to Menu
              </button>
            </router-link>
          </div>
        </template>
      </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import io from 'socket.io-client'

const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling'],
    withCredentials: true
})
const gameId = ref('')
const createdGameId = ref('')
const router = useRouter()

const createNewGame = () => {
    console.log('Requesting new game...')
    socket.emit('createGame')
}

const joinGame = () => {  // async entfernt
    if (gameId.value) {
        console.log('Joining game:', gameId.value)
        socket.emit('joinGame', gameId.value)
    }
}


onMounted(() => {
  // Verbindungs-Status-Logging
  socket.on('connect', () => {
    console.log('Connected to server')
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from server')
  })

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
  })

  // Game Events
  socket.on('gameCreated', (id) => {
    console.log('Game created with ID:', id)
    createdGameId.value = id
  })

  socket.on('gameJoined', (id) => {
    console.log('Successfully joined game:', id)
    router.push(`/tictactoe?gameId=${id}&player=O`)
  })

  socket.on('error', (message) => {
    console.error('Game error:', message)
    alert(message)
  })
})

onUnmounted(() => {
  // Cleanup socket event listeners
  socket.off('gameCreated')
  socket.off('gameJoined')
  socket.off('error')
  socket.off('connect')
  socket.off('disconnect')
  socket.off('connect_error')
  socket.disconnect()
})
</script>
  
<style scoped>
  #gameIdContainer {
    text-align: center;
    margin: 23px;
    padding: 23px;
  }
</style>