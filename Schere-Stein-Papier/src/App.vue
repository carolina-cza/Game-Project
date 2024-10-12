<template>
  <div id="app">
    <Login v-if="!user" @login="handleLogin" />
    <Game v-else :user="user" />
  </div>
</template>

<script>
import Login from './components/Login.vue';
import Game from './components/Game.vue';

export default {
  components: {
    Login,
    Game
  },
  data() {
    return {
      user: null
    };
  },
  methods: {
    handleLogin(user) {
      this.user = user;
    }
  }
};
</script>

<style>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
