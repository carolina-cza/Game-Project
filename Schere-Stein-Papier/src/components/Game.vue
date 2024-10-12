<template>
    <div>
      <h2>Schere Stein Papier</h2>
      <div class="choices">
        <button @click="play('Schere')">✂️</button>
        <button @click="play('Stein')">🪨</button>
        <button @click="play('Papier')">📄</button>
      </div>
      <div class="result">
        <p>Du: {{ playerChoice }}</p>
        <p>Computer: {{ computerChoice }}</p>
        <p>Ergebnis: {{ result }}</p>
      </div>
      <button @click="saveScore">Spielstand speichern</button>
    </div>
  </template>
  
  <script>
  export default {
    props: ['user'],
    data() {
      return {
        playerChoice: '',
        computerChoice: '',
        result: ''
      };
    },
    methods: {
      play(choice) {
        this.playerChoice = choice;
        const choices = ['Schere', 'Stein', 'Papier'];
        this.computerChoice = choices[Math.floor(Math.random() * choices.length)];
        this.result = this.determineWinner(this.playerChoice, this.computerChoice);
      },
      determineWinner(player, computer) {
        if (player === computer) {
          return 'Unentschieden';
        } else if (
          (player === 'Schere' && computer === 'Papier') ||
          (player === 'Stein' && computer === 'Schere') ||
          (player === 'Papier' && computer === 'Stein')
        ) {
          return 'Du gewinnst!';
        } else {
          return 'Computer gewinnt!';
        }
      },
      async saveScore() {
        const response = await fetch('http://localhost:3000/save-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.user.id, score: this.result === 'Du gewinnst!' ? 1 : 0 })
        });
        const data = await response.json();
        if (data.success) {
          alert('Spielstand gespeichert!');
        } else {
          alert('Fehler beim Speichern des Spielstands.');
        }
      }
    }
  };
  </script>
  