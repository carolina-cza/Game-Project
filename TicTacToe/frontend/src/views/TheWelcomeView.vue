<template>
    <div id='theContainer'>
      <h1>Welcome</h1>
      <h2>Mert's Tic-Tac-Toe Game</h2>
      <router-link to="/joinid">
        <button style="margin: 23px; width: 24%;">Play Game</button>
      </router-link>
    </div>
  </template>
  
  <style>
  #theContainer {
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
  h2 {
    text-align: center;
    margin-bottom: 24px;
    font-weight: lighter;
    font-family: system-ui;
    color: white;
  }
  button {
    width: 50%;
    border: 1px solid white !important;
    padding: 10px;
    background-color: transparent;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
  }
  </style>
  