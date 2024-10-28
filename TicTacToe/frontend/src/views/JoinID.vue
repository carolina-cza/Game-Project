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
  
  const socket = io('http://localhost:3001')
  const gameId = ref('')
  const createdGameId = ref('')
  const router = useRouter()
  
  const createNewGame = () => {
    socket.emit('createGame')
    // Weiterleitung erst nach Anzeige der ID
  }
  
  const joinGame = () => {
    if (gameId.value) {
      socket.emit('joinGame', gameId.value)
    }
  }
  
  onMounted(() => {
    socket.on('gameCreated', (id) => {
      console.log('Game created with ID:', id)
      createdGameId.value = id
      // Weiterleitung erst nach Klick auf einen neuen "Start Game" Button
    })
  
    socket.on('gameJoined', (id) => {
      console.log('Joined game with ID:', id)
      router.push(`/tictactoe?gameId=${id}&player=O`)
    })
  
    socket.on('error', (message) => {
      alert(message)
    })
  })
  
  onUnmounted(() => {
    socket.disconnect()
  })
</script>
  
<style scoped>
  #gameIdContainer {
    text-align: center;
    margin: 23px;
    padding: 23px;
  }
  
  h1 {
    text-align: center;
    margin-top: 45px;
    margin-bottom: 45px;
    color: white;
    width: 100%;
  }
  
  .input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .button-container {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  
  .game-id-input {
    width: 50%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid white;
    background-color: transparent;
    color: white;
    font-size: 16px;
  }
  
  .game-id-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .enter-button {
    width: 150px;
    border: 1px solid white !important;
    padding: 12px;
    background-color: transparent;
    color: white;
    border-radius: 12px;
    cursor: pointer;
  }
  
  .enter-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Neue Styles für die Game-ID Anzeige */
  .game-id-display {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .id-highlight {
    font-size: 24px;
    font-weight: bold;
    color: #ff4081;
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }
  
  .info-text {
    color: rgba(255, 255, 255, 0.7);
    margin-top: 10px;
    font-size: 14px;
  }
</style>