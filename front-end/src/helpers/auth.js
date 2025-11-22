import Vue from 'vue';

const storedUser = localStorage.getItem('user');

const state = Vue.observable({
    user: storedUser ? JSON.parse(storedUser) : null
});

export const auth = {
    state,
    isAuthenticated() {
        return !!state.user;
    },
    setUser(user) {
        state.user = user;
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }
};