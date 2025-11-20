<template>
    <div>
        <h1>New Word</h1>
        <word-form :word="word" @createOrUpdate="createOrUpdate" />
    </div>
</template>
<script>
import WordForm from '../components/WordForm.vue';
import { api } from '../helpers/helpers';

export default {
    name: 'New',
    components: {
        'word-form': WordForm
    },
    data() {
        return {
            word: {
                english: '',
                german: '',
                vietnamese: ''
            }
        };
    },
    methods: {
        createOrUpdate: async function(word) {
            const createdWord = await api.createWord({
                english: word.english,
                german: word.german,
                vietnamese: word.vietnamese
            });
            alert('Word created successfully!');
            this.$router.push(`/words/${createdWord._id}`);
        }
    }
};
</script>