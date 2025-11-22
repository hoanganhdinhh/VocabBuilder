<template>
    <div>
        <h1>Sign Up</h1>
        <form class="ui form" @submit.prevent="onSubmit">
            <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="Email" required />
            </div>
            <div class="field">
                <label>Password</label>
                <input v-model="form.password" type="password" placeholder="Password" required />
            </div>
            <button class="ui primary button" type="submit" :class="{ loading: isSubmitting }">
                Create Account
            </button>
            <div v-if="message" class="ui message" :class="messageType">
                {{ message }}
            </div>
        </form>
    </div>
</template>

<script>
import { api } from '../helpers/helpers';
import { auth } from '../helpers/auth';

export default {
    name: 'Signup',
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            message: '',
            messageType: 'positive',
            isSubmitting: false
        };
    },
    methods: {
        async onSubmit() {
            this.isSubmitting = true;
            this.message = '';
            this.messageType = 'positive message';

            try {
                const user = await api.signup({
                    email: this.form.email,
                    password: this.form.password
                });
                auth.setUser(user);
                const redirect = this.$route.query.redirect || { name: 'words' };
                this.$router.push(redirect);
            } catch (error) {
                const responseMessage = error.response?.data?.message || 'Unable to create account right now.';
                this.message = responseMessage;
                this.messageType = 'negative message';
            } finally {
                this.isSubmitting = false;
            }
        }
    }
};
</script>