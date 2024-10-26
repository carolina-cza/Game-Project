import { createRouter, createWebHistory } from 'vue-router'
import TheWelcomeView from '@/views/TheWelcomeView.vue'
import TicTacToeView from '@/views/TicTacToeView.vue'

const routes = [
  { path: '/', component: TheWelcomeView },
  { path: '/tictactoe', component: TicTacToeView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
