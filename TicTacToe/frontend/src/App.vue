<template>
	<div id="app">
	  <HeaderComponent />
	  <router-view></router-view>
	</div>
  </template>
  
  <script setup>
  import HeaderComponent from './components/HeaderComponent.vue'
  </script>
  
  <style>
  body {
	background-color: #2d3748; /* bg-gray-800 */
	color: #ffffff; /* text-white */
	margin: 0;
	font-family: Arial, sans-serif;
  }
  #app {
	text-align: center;
  }
  </style>
  