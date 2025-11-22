<template>
    <form action="#" @submit.prevent="onSubmit">
        <p v-if="errorsPresent" class="error">Please fill out both fields!</p>

        <div class="ui labeled input fluid" style="margin-top:10px;">
            <div class="ui label">
                <i class="united kingdom flag"></i> English
            </div>
            <input type="text" placeholder="Enter word..." v-model="word.english" />
        </div>

        <div class="actions">
            <button
                type="button"
                class="ui button"
                :class="{ loading: suggesting }"
                @click="suggestTranslations"
            >
                Suggest translations
            </button>
            <span v-if="suggestionError" class="error">{{ suggestionError }}</span>
        </div>

        <div class="ui labeled input fluid">
            <div class="ui label">
                <i class="germany flag"></i> German
            </div>
            <input type="text" placeholder="Enter word..." v-model="word.german" />
        </div>

        <div class="ui labeled input fluid" style="margin-top:10px;">
            <div class="ui label">
                <i class="vietnam flag"></i> Vietnamese
            </div>
            <input type="text" placeholder="Enter word..." v-model="word.vietnamese" />
        </div>

        <button class="positive ui button" style="margin-top:12px;">Submit</button>
    </form>
</template>


<script>
import { api } from '../helpers/helpers';

export default {
    name: 'word-form',
    props: {
        word: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            errorsPresent: false,
            suggesting: false,
            suggestionError: ''
        };
    },
    methods: {
        suggestTranslations: async function() {
            this.suggestionError = '';
            if (!this.word.english) {
                this.suggestionError = 'Please enter an English word first.';
                return;
            }

            this.suggesting = true;
            try {
                const suggestions = await api.suggestTranslations(this.word.english);
                this.word.german = suggestions.german;
                this.word.vietnamese = suggestions.vietnamese;
            } catch (error) {
                this.suggestionError = 'Unable to fetch suggestions right now. Please try again.';
            } finally {
                this.suggesting = false;
            }
        },
        onSubmit: function() {
            if (this.word.english === '' || this.word.german === '' || this.word.vietnamese === '') {
                this.errorsPresent = true;
            } else {
                this.$emit('createOrUpdate', this.word);
            }
        }
    }
};
</script>

<style scoped>
.actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
}

.error {
    color: #b00;
}
</style>