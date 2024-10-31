<template>
  <div id="gameIdContainer">

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
          <button @click="createNewGame" class="enter-button">Create New Game</button>
          <button @click="joinGame" :disabled="!gameId" class="enter-button">Join Game</button>
          <router-link to="/">
            <button class="enter-button">Back to Menu</button>
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

const currentUser = ref(null)
const showLoginModal = ref(false)
const showRegisterModal = ref(false)


// Session-Status beim Laden prüfen
onMounted(async () => {
  const sessionToken = localStorage.getItem('sessionToken')
  if (sessionToken) {
    try {
      const response = await fetch('http://localhost:3001/api/check-session', {
        headers: { 'Authorization': sessionToken }
      })
      const data = await response.json()
      if (response.ok) currentUser.value = data.username
    } catch (error) {
      console.error('Session check failed:', error)
    }
  }

  // Socket Events
  socket.on('connect', () => console.log('Connected to server'))
  socket.on('disconnect', () => console.log('Disconnected from server'))
  socket.on('connect_error', (error) => console.error('Connection error:', error))
  socket.on('gameCreated', (id) => createdGameId.value = id)
  socket.on('gameJoined', (id) => router.push(`/tictactoe?gameId=${id}&player=O`))
  socket.on('error', (message) => alert(message))
})


const createNewGame = () => socket.emit('createGame')
const joinGame = () => {
  if (gameId.value) socket.emit('joinGame', gameId.value)
}

onUnmounted(() => {
  socket.disconnect()
})
</script>
  
<style scoped>
  /* Allgemeine Container-Einstellungen */
  #gameIdContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  /* Authentifizierungscontainer und -Buttons */
  .auth-container {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
  }

  .auth-button {
    padding: 8px 16px;
    background-color: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .auth-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .user-info {
    color: white;
    margin-right: 10px;
  }

  /* Überschriften */
  h1, h2 {
    color: white;
  }

  h1 {
    margin-top: 45px;
    margin-bottom: 45px;
  }

  h2 {
    margin-bottom: 24px;
    font-weight: lighter;
    font-family: system-ui;
  }

  /* Eingabe für Game ID und Buttons */
  .input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .game-id-display, .info-text {
    text-align: center;
  }

  .id-highlight {
    font-weight: bold;
    color: #007bff;
  }

  .game-id-input {
    padding: 10px;
    font-size: 16px;
    margin-bottom: 10px;
    border: 1px solid #444;
    border-radius: 5px;
    background-color: #333;
    color: white;
    text-align: center;
    width: 200px;
  }

  .button-container {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .enter-button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .enter-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* Modal für Anmelden und Registrieren */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background-color: #2a2a2a;
    padding: 2rem;
    border-radius: 12px;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .modal-input {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #444;
    background-color: #333;
    color: white;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
  }

  .modal-button {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    background-color: #4a4a4a;
    color: white;
    transition: background-color 0.3s;
  }

  .modal-button:hover {
    background-color: #5a5a5a;
  }

  .modal-button.cancel {
    background-color: #666;
  }

  .modal-button.cancel:hover {
    background-color: #777;
  }
</style>

