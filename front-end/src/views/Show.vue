<template>
    <div>
        <div v-if="loading" class="ui active inline loader" aria-label="Loading word details"></div>
        <div v-else-if="error" class="ui negative message">
            <div class="header">Unable to load word</div>
            <p>{{ error }}</p>
        </div>
        <div v-else class="ui segment">
            <h1 class="ui header">
                Word Details
                <div class="sub header">Review the English, German, and Vietnamese translations</div>
            </h1>

            <div class="ui list">
                <div class="item">
                    <div class="header">English</div>
                    <div>{{ word.english }}</div>
                </div>
                <div class="item">
                    <div class="header">German</div>
                    <div>{{ word.german }}</div>
                </div>
                <div class="item">
                    <div class="header">Vietnamese</div>
                    <div>{{ word.vietnamese }}</div>
                </div>
            </div>

            <div class="ui divider"></div>

            <div class="ui buttons">
                <router-link
                    :to="{ name: 'edit', params: { id: wordId } }"
                    class="ui primary button"
                >
                    Edit
                </router-link>
                <div class="or" role="presentation"></div>
                <button class="ui button" type="button" @click="goBack">Back</button>
                <button class="ui red button" type="button" @click="destroyWord">Delete</button>
            </div>
        </div>
    </div>
</template>

<script>
import { api } from '../helpers/helpers';

export default {
    name: 'Show',
    data() {
        return {
            word: {
                _id: '',
                english: '',
                german: '',
                vietnamese: ''
            },
            loading: true,
            error: ''
        };
    },
    computed: {
        wordId() {
            return this.word._id || this.word.id || this.$route.params.id;
        }
    },
    async mounted() {
        await this.fetchWord();
    },
    methods: {
        async fetchWord() {
            this.loading = true;
            this.error = '';

            try {
                const fetchedWord = await api.getWord(this.$route.params.id);
                this.word = fetchedWord;
            } catch (err) {
                this.error = 'Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        goBack() {
            this.$router.push('/words');
        },
        async destroyWord() {
            if (!this.wordId) {
                return;
            }

            const confirmed = window.confirm('Are you sure you want to delete this word?');

            if (!confirmed) {
                return;
            }

            try {
                await api.deleteWord(this.wordId);
                alert('Word deleted successfully!');
                this.$router.push('/words');
            } catch (err) {
                alert('Unable to delete the word. Please try again later.');
            }
        }
    }
};
</script>