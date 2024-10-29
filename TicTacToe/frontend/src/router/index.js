import { createRouter, createWebHistory } from 'vue-router'
import TheWelcomeView from '@/views/TheWelcomeView.vue'
import TicTacToeView from '@/views/TicTacToeView.vue'
import JoinID from '@/views/JoinID.vue'
import HelpView from '@/views/HelpView.vue'

const routes = [
  { path: '/', component: TheWelcomeView },
  { path: '/joinid', component: JoinID },
  { path: '/tictactoe', component: TicTacToeView },
  { path: '/help', component: HelpView } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router