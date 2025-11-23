<template>
    <div>
        <h1>Email Verification</h1>
        <p>Enter the OTP sent to your email to activate your account.</p>
        <form class="ui form" @submit.prevent="onVerify">
            <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="Email" required />
            </div>
            <div class="field">
                <label>OTP Code</label>
                <input v-model="form.code" type="text" placeholder="Enter 6-digit code" required />
            </div>
            <button class="ui primary button" type="submit" :class="{ loading: isSubmitting }">
                Verify
            </button>
            <button
                class="ui button"
                type="button"
                :class="{ loading: isResending }"
                @click="onResend"
            >
                Resend Code
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
    name: 'VerifyEmail',
    data() {
        return {
            form: {
                email: this.$route.query.email || '',
                code: ''
            },
            message: '',
            messageType: 'positive message',
            isSubmitting: false,
            isResending: false
        };
    },
    methods: {
        async onVerify() {
            this.isSubmitting = true;
            this.message = '';
            this.messageType = 'positive message';

            try {
                const user = await api.verifyOtp({
                    email: this.form.email,
                    code: this.form.code
                });

                auth.setUser(user);
                this.message = 'Verification successful! You will be redirected to the word list.';
                this.messageType = 'positive message';

                this.$router.push({ name: 'words' });
            } catch (error) {
                const responseMessage = error.response?.data?.message || 'Unable to verify at this time.';
                this.message = responseMessage;
                this.messageType = 'negative message';
            } finally {
                this.isSubmitting = false;
            }
        },
        async onResend() {
            if (!this.form.email) {
                this.message = 'Please enter your email to resend the OTP.';
                this.messageType = 'negative message';
                return;
            }

            this.isResending = true;
            this.message = '';

            try {
                const response = await api.resendOtp({ email: this.form.email });
                this.message = response.message || 'A new verification code has been sent.';
                this.messageType = 'positive message';
            } catch (error) {
                const responseMessage = error.response?.data?.message || 'Unable to resend the code at this time.';
                this.message = responseMessage;
                this.messageType = 'negative message';
            } finally {
                this.isResending = false;
            }
        }
    }
};
</script>