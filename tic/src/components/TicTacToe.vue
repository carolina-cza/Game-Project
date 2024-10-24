<template>
    <div>
      <h1>Tic-Tac-Toe</h1>
      <h2>Player {{ player }}'s turn</h2>
      <div class="board">
        <div v-for="(cell, index) in board" :key="index" class="cell" @click="makeMove(index)">
          {{ cell }}
        </div>
      </div>
      <p v-if="winner">{{ winner === 'draw' ? 'It\'s a draw!' : 'Winner: ' + winner }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        player: this.$route.params.player,
        board: Array(9).fill(null),
        winner: null
      };
    },
    methods: {
      makeMove(position) {
        if (this.board[position] || this.winner) return;
  
        fetch('http://localhost:3000/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: this.player, position })
        })
          .then(response => response.json())
          .then(data => {
            this.board = data.board;
            this.winner = data.winner;
          });
      }
    },
    created() {
      fetch('http://localhost:3000/state')
        .then(response => response.json())
        .then(data => {
          if (data.length) {
            const latestGame = data[0];
            this.board = JSON.parse(latestGame.board);
            this.winner = latestGame.winner;
          }
        });
    }
  };
  </script>
  
  <style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    gap: 10px;
  }
  .cell {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    border: 1px solid black;
  }
  </style>