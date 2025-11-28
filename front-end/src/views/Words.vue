<template>
    <div>
        <h1>Words</h1>
            <div class="ui action input" style="margin-bottom: 1rem;">
                <input v-model="searchTerm" type="text" placeholder="Search words" @keyup.enter="search" />
                <button class="ui button" type="button" @click="search">Search</button>
                <button class="ui button" type="button" @click="resetSearch" :disabled="!searchTerm">Clear</button>
            </div>
        <table id="words" class="ui celled compact table">
            <thead>
                <tr>
                    <th>English</th>
                    <th>German</th>
                    <th>Vietnamese</th>
                    <th colspan="3"></th>
                </tr>
            </thead>
            <tr v-for="(word, i) in words" :key="word._id || i">
                <td>{{ word.english }}</td>
                <td>{{ word.german }}</td>
                <td>{{ word.vietnamese }}</td>
                <td width="75" class="center aligned">
                    <router-link class="ui button" :to="{name: 'show', params: { id: word._id }}">Show</router-link></td>
                <td width="75" class="center aligned">
                    <router-link class="ui blue button" :to="{name: 'edit', params: { id: word._id }}">Edit</router-link></td>
                <td width="75" class="center aligned">
                    <a class="ui red basic button" @click="destroyWord(word._id)">Destroy</a></td>
                
            </tr>
        </table>
    </div>
</template>

<script>
import { api } from '../helpers/helpers';

export default {
    name: 'words',
    data() {
        return {
            words: [],
            allWords: [],
            searchTerm: ''
        };
    },
    async mounted() {
         this.allWords = await api.getWords();
        this.words = this.allWords;
    },
    methods: {
        async search() {
            const query = this.searchTerm.trim();
            if (!query) {
                this.words = this.allWords;
                return;
            }

            const results = await api.searchWords(query);
            this.words = results;
        },
        resetSearch() {
            this.searchTerm = '';
            this.words = this.allWords;
        },
        async destroyWord(wordId) {
            if (!wordId) {
                return;
            }

            const confirmed = window.confirm('Are you sure you want to delete this word?');

            if (!confirmed) {
                return;
            }

            try {
                await api.deleteWord(wordId);
                this.allWords = this.allWords.filter(word => word._id !== wordId);
                this.words = this.words.filter(word => word._id !== wordId);
                alert('Word deleted successfully!');
            } catch (err) {
                alert('Unable to delete the word. Please try again later.');
            }
        }
    }
};
</script>