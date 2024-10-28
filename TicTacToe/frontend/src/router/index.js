import { createRouter, createWebHistory } from 'vue-router'
import TheWelcomeView from '@/views/TheWelcomeView.vue'
import TicTacToeView from '@/views/TicTacToeView.vue'
import JoinID from '@/views/JoinID.vue'

const routes = [
  { path: '/', component: TheWelcomeView },
  { path: '/joinid', component: JoinID },
  { path: '/tictactoe', component: TicTacToeView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router