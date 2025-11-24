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
            <p>Add at least two vocabulary entries to start a quiz.</p>
        </div>

        <div v-else>
            <div class="ui message" v-if="!quizStarted">
                <div class="header">Create a quiz to check your vocabulary</div>
                <p>You will receive {{ questionCount }} questions translating from English to German with multiple choices.</p>
                <button class="ui primary button" type="button" @click="startGermanQuiz" :disabled="!canCreateQuiz">
                    Start Quiz
                </button>
                <p v-if="!canCreateQuiz" class="ui red text">At least two words are needed to create questions.</p>
            </div>

            <div class="ui message" v-if="!quizStarted">
                <div class="header">Create a quiz to check your vocabulary</div>
                <p>You will receive {{ questionCount }} questions translating from English to Vietnamese with multiple choices.</p>
                <button class="ui primary button" type="button" @click="startVietnameseQuiz" :disabled="!canCreateQuiz">
                    Start Quiz
                </button>
                <p v-if="!canCreateQuiz" class="ui red text">At least two words are needed to create questions.</p>
            </div>

            <div v-else-if="showResults" class="ui segment">
                <h2 class="ui header">Results</h2>
                <p>You answered {{ score }} / {{ quizQuestions.length }} questions correctly.</p>
                <button class="ui primary button" type="button" @click="startQuiz">Retry</button>
            </div>

            <div v-else class="ui segment">
                <div class="ui top attached label">Question {{ currentQuestionNumber }} / {{ quizQuestions.length }}</div>
                <h2 class="ui header">
                    Translate to {{ targetLanguage }}:
                    <div class="sub header">{{ currentQuestion.prompt }}</div>
                </h2>

                <form class="ui form" @submit.prevent="submitAnswer">
                    <div class="grouped fields">
                        <div
                            v-for="option in currentQuestion.options"
                            :key="option"
                            class="field"
                        >
                            <div class="ui radio checkbox">
                                <input
                                    type="radio"
                                    :id="option"
                                    :value="option"
                                    v-model="selectedAnswer"
                                />
                                <label :for="option">{{ option }}</label>
                            </div>
                        </div>
                    </div>

                    <button class="ui primary button" type="submit" :disabled="!selectedAnswer">
                        Check Answer
                    </button>
                </form>

                <div v-if="answered" class="ui message" :class="{ positive: isCorrect, negative: !isCorrect }">
                    <div class="header">{{ feedbackTitle }}</div>
                    <p>{{ feedbackMessage }}</p>
                </div>

                <div class="ui divider"></div>

                <button class="ui button" type="button" @click="nextQuestion" :disabled="!answered">
                    Next Question
                </button>
            </div>
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
            quizQuestions: [],
            currentIndex: 0,
            selectedAnswer: '',
            answered: false,
            isCorrect: false,
            feedbackMessage: '',
            score: 0,
            questionCount: 5,
            quizStarted: false,
            quizLanguage: null, // 'german' or 'vietnamese'
            loading: false,
            error: ''
        };
    },
    computed: {
        hasWords() {
            return this.words.length > 0;
        },
        canCreateQuiz() {
            return this.words.length >= 2;
        },
        currentQuestion() {
            return this.quizQuestions[this.currentIndex] || { options: [], prompt: '', correct: '' };
        },
        currentQuestionNumber() {
            return this.currentIndex + 1;
        },
        feedbackTitle() {
            return this.isCorrect ? 'Correct!' : 'Try Again';
        },
        showResults() {
            return this.quizStarted && this.currentIndex >= this.quizQuestions.length;
        },
        targetLanguage() {
            if (this.quizLanguage === 'german') return 'German';
            if (this.quizLanguage === 'vietnamese') return 'Vietnamese';
            return 'German/Vietnamese';
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
            } catch (err) {
                this.error = 'Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },
        startGermanQuiz() {
            if (!this.canCreateQuiz) {
                return;
            }

            this.quizLanguage = 'german';

            const shuffled = [...this.words];
            this.shuffle(shuffled);

            const questions = shuffled.slice(0, Math.min(this.questionCount, shuffled.length)).map(word => ({
                prompt: word.english,
                correct: word.german,
                options: this.buildOptions(word, 'german')
            }));

            this.quizQuestions = questions;
            this.currentIndex = 0;
            this.selectedAnswer = '';
            this.answered = false;
            this.score = 0;
            this.quizStarted = true;
        },
        startVietnameseQuiz() {
            if (!this.canCreateQuiz) {
                return;
            }

            this.quizLanguage = 'vietnamese';

            const shuffled = [...this.words];
            this.shuffle(shuffled);

            const questions = shuffled.slice(0, Math.min(this.questionCount, shuffled.length)).map(word => ({
                prompt: word.english,
                correct: word.vietnamese,
                options: this.buildOptions(word, 'vietnamese')
            }));

            this.quizQuestions = questions;
            this.currentIndex = 0;
            this.selectedAnswer = '';
            this.answered = false;
            this.score = 0;
            this.quizStarted = true;
        },
        buildOptions(correctWord, lang) {
            const distractors = this.words
                .filter(word => word._id !== correctWord._id)
                .map(word => word[lang]);

            this.shuffle(distractors);

            const options = [correctWord[lang], ...distractors.slice(0, 3)];
            this.shuffle(options);

            return options;
        },
        submitAnswer() {
            if (!this.selectedAnswer || this.answered) {
                return;
            }

            this.isCorrect = this.selectedAnswer === this.currentQuestion.correct;
            this.feedbackMessage = this.isCorrect
                ? 'You selected the correct translation!'
                : `The correct answer is "${this.currentQuestion.correct}".`;
            this.answered = true;

            if (this.isCorrect) {
                this.score += 1;
            }
        },
        nextQuestion() {
            if (!this.answered) {
                return;
            }

            this.currentIndex += 1;
            this.selectedAnswer = '';
            this.answered = false;
            this.feedbackMessage = '';
            this.isCorrect = false;
        },
        // helper to restart; keeps same language if desired
        startQuiz() {
            if (this.quizLanguage === 'vietnamese') this.startVietnameseQuiz();
            else this.startGermanQuiz();
        }
    }
};
</script>