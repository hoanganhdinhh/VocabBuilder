<template>
  <div id="app">
    <div class="ui inverted segment navbar">
      <div class="ui center aligned container">
        <div class="ui large secondary inverted pointing menu compact">
          <router-link v-if="isAuthenticated" to="/words" exact class="item">
            <i class="comment outline icon"></i> Words
          </router-link>

          <router-link v-if="isAuthenticated" to="/words/new" class="item">
            <i class="plus circle icon"></i> New
          </router-link>

          <router-link v-if="isAuthenticated" to="/test" class="item">
            <i class="graduation cap icon"></i> Test
          </router-link>

          <router-link v-if="!isAuthenticated" to="/login" class="item">
            <i class="sign in icon"></i> Login
          </router-link>

          <router-link v-if="!isAuthenticated" to="/signup" class="item">
            <i class="user plus icon"></i> Sign Up
          </router-link>

          <div v-if="isAuthenticated" class="item">
            <i class="user icon"></i> {{ userEmail }}
          </div>

          <a v-if="isAuthenticated" class="item" @click.prevent="logout">
            <i class="sign out icon"></i> Logout
          </a>
        </div>
      </div>
    </div>

    <div class="ui text container">
      <div class="ui one column grid">
        <div class="column">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from './helpers/auth';

export default {
  name: 'app',
  computed: {
    isAuthenticated() {
      return auth.isAuthenticated();
    },
    userEmail() {
      return auth.state.user?.email || '';
    }
  },
  methods: {
    logout() {
      auth.setUser(null);
      this.$router.push({ name: 'login' });
    }
  }
};
</script>

<!-- <script>
export default {
  name: 'app'
};
</script> -->

<style>
#app > div.navbar {
  margin-bottom: 1.5em;
}

.myFlash {
  width: 250px;
  margin: 10px;
  position: absolute;
  top: 50px;
  right: 0;
}

input {
  width: 300px;
}

div.label {
  width: 120px;
}

div.input {
  margin-bottom: 10px;
}

button.ui.button {
  margin-top: 15px;
  display: block;
}
</style>