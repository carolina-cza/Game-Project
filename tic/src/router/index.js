// /frontend/src/router/index.js
import Vue from 'vue';
import Router from 'vue-router';
import TicTacToe from '@/components/TicTacToe.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/player/:player',
      component: TicTacToe
    }
  ]
});