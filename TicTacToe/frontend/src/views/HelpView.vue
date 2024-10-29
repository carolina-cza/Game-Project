<template>
    <div id="help-container">
      <h1>Help</h1>
      <p>This is a simple Tic-Tac-Toe game. Here’s how to play:</p>
      <ul>
        <li>Select "Play Game" to start the Tic-Tac-Toe game.</li>
        <li>The goal is to place three of your symbols (X or O) in a row, column, or diagonal before your opponent.</li>
        <li>Click on an empty square to make your move.</li>
        <li>The game ends when there is a winner or when all squares are filled, resulting in a draw.</li>
      </ul>
      <router-link to="/">
        <button>Back to Welcome</button>
      </router-link>
    </div>
  </template>
  
  <style>
  #help-container {
    text-align: center;
    margin: 23px;
    padding: 23px;
  }
  </style>