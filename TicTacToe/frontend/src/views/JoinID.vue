<template>
  <div id="gameIdContainer">
    <h1>Enter Game ID</h1>
    <div class="input-container">
      <div v-if="createdGameId" class="game-id-display">
        <p>
          Your Game ID: <span class="id-highlight">{{ createdGameId }}</span>
        </p>
        <p class="info-text">Share this ID with your opponent</p>
        <button
          @click="router.push(`/tictactoe?gameId=${createdGameId}&player=X`)"
          class="enter-button mt-4"> Start Game
        </button>
      </div>
      <template v-else>
        <input
          v-model="gameId"
          type="text"
          placeholder="Enter your game ID..."
          class="game-id-input"
        />
        <div class="button-container">
          <button @click="createNewGame" class="enter-button">
            Create New Game
          </button>
          <button @click="joinGame" :disabled="!gameId" class="enter-button">
            Join Game
          </button>
          <router-link to="/">
            <button class="enter-button">Back to Menu</button>
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
const gameId = ref("");
const createdGameId = ref("");
const router = useRouter();

const currentUser = ref(null);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);

// Session-Status beim Laden prüfen
onMounted(async () => {
  const sessionToken = localStorage.getItem("sessionToken");
  if (sessionToken) {
    try {
      const response = await fetch("http://localhost:3001/api/check-session", {
        headers: { Authorization: sessionToken },
      });
      const data = await response.json();
      if (response.ok) currentUser.value = data.username;
    } catch (error) {
      console.error("Session check failed:", error);
    }
  }

  // Socket Events
  socket.on("connect", () => console.log("Connected to server"));
  socket.on("disconnect", () => console.log("Disconnected from server"));
  socket.on("connect_error", (error) =>
    console.error("Connection error:", error)
  );
  socket.on("gameCreated", (id) => (createdGameId.value = id));
  socket.on("gameJoined", (id) =>
    router.push(`/tictactoe?gameId=${id}&player=O`)
  );
  socket.on("error", (message) => alert(message));
});

const createNewGame = () => socket.emit("createGame");
const joinGame = () => {
  if (gameId.value) socket.emit("joinGame", gameId.value);
};

onUnmounted(() => {
  socket.disconnect();
});
</script>

<style scoped>
/* Allgemeine Container-Einstellungen */
#gameIdContainer {
  text-align: center;
  margin: 23px;
  padding: 23px;
}
</style>
