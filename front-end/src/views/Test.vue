<template>
    <div>
        <h1 class="ui header">Test Yourself</h1>

        <div v-if="loading" class="ui active inline loader" aria-label="Loading test words"></div>

        <div v-else-if="error" class="ui negative message">
            <div class="header">Unable to load words</div>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="!hasWords" class="ui message">
            <div class="header">No words available</div>
            <p>Add some vocabulary first so you can start practicing.</p>
        </div>

        <div v-else class="ui segment">
            <h2 class="ui header">
                Translate this word to German
                <div class="sub header">{{ currentWord.english }}</div>
            </h2>
            <form class="ui form" @submit.prevent="submitAnswer">
                <div class="field">
                    <label for="answer">Your answer</label>
                    <input
                        id="answer"
                        ref="answerInput"
                        type="text"
                        v-model="userAnswer"
                        autocomplete="off"
                        placeholder="Type the German translation"
                        :disabled="showFeedback"
                    />
                </div>

                <button class="ui primary button" type="submit" :disabled="showFeedback || !userAnswer.trim()">
                    Check answer
                </button>
                <button
                    class="ui button"
                    type="button"
                    @click="revealAnswer"
                    :disabled="showFeedback"
                >
                    Reveal answer
                </button>
            </form>

            <div v-if="showFeedback" class="ui message" :class="{ positive: isCorrect, negative: !isCorrect }">
                <div class="header">{{ feedbackTitle }}</div>
                <p>{{ feedbackMessage }}</p>
            </div>

            <div class="ui divider"></div>

            <button class="ui secondary button" type="button" @click="nextWord">Next word</button>
        </div>
    </div>
</template>

<script>
import { api } from '../helpers/helpers';

export default {
    name: 'Test',
    data() {
        return {
            words: [],
            order: [],
            currentIndex: 0,
            userAnswer: '',
            showFeedback: false,
            isCorrect: false,
            loading: true,
            error: '',
            feedbackMessage: ''
        };
    },
    computed: {
        hasWords() {
            return this.words.length > 0;
        },
        currentWord() {
            if (!this.hasWords) {
                return { english: '', german: '' };
            }

            const currentOrderIndex = this.order[this.currentIndex];
            return this.words[currentOrderIndex];
        },
        feedbackTitle() {
            return this.isCorrect ? 'Great job!' : 'Keep practicing';
        }
    },
    async mounted() {
        await this.loadWords();
    },
    methods: {
        async loadWords() {
            this.loading = true;
            this.error = '';

            try {
                const words = await api.getWords();
                this.words = words;
                this.resetOrder();
            } catch (err) {
                this.error = 'Please try again later.';
            } finally {
                this.loading = false;
                this.focusInput();
            }
        },
        resetOrder() {
            this.order = this.words.map((_, index) => index);
                this.shuffle(this.order);
            this.currentIndex = 0;
        },
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },
        submitAnswer() {
            if (!this.userAnswer.trim()) {
                return;
            }

            this.isCorrect = this.userAnswer.trim().toLowerCase() === this.currentWord.german.toLowerCase();
            this.feedbackMessage = this.isCorrect
                ? 'Correct translation!'
                : `The correct translation is "${this.currentWord.german}".`;
            this.showFeedback = true;
        },
        revealAnswer() {
            this.isCorrect = false;
            this.feedbackMessage = `The correct translation is "${this.currentWord.german}".`;
            this.showFeedback = true;
        },
        nextWord() {
            if (!this.hasWords) {
                return;
            }

            this.currentIndex = (this.currentIndex + 1) % this.order.length;
            if (this.currentIndex === 0) {
                this.shuffle(this.order);
            }

            this.userAnswer = '';
            this.showFeedback = false;
            this.feedbackMessage = '';
            this.focusInput();
        },
        focusInput() {
            this.$nextTick(() => {
                if (this.$refs.answerInput) {
                    this.$refs.answerInput.focus();
                }
            });
        }
    }
};
</script>