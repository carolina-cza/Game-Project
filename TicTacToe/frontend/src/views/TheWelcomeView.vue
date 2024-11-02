<template>
  <div id="theContainer">
    <h1>Welcome Player!</h1>
    <h2>Tic-Tac-Toe Game</h2>
    <div class="game-buttons">
      <router-link to="/joinid">
        <button class="game-button">Play Game</button>
      </router-link>
      <router-link to="/help">
        <button class="game-button">Help</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
#theContainer {
  text-align: center;
  margin: 23px;
  padding: 23px;
  position: relative;
}

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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 12px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

h1,
h2 {
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

.game-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.game-button {
  padding: 12px;
  border: 1px solid white;
  background-color: transparent;
  color: white;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game-button:hover {
  background-color: rgba(255, 255, 255, 255, 0.1);
}
</style>
