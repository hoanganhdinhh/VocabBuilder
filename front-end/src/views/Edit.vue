<template>
    <div>
        <h1>Edit Word</h1>
        <!-- <word-form :word=this.word /> -->
        <word-form @createOrUpdate="createOrUpdate" :word="this.word"></word-form>
    </div>
</template>

<script>
import WordForm from '../components/WordForm.vue'
import { api } from '../helpers/helpers'

export default {
    name: 'Edit',
    components: {
        'word-form': WordForm
    },

    data: function(params) {
        return {
            word: {
                english: '',
                german: '',
                vietnamese: ''
            }
        };
    },
    async mounted() {
        this.word = await api.getWord(this.$route.params.id);
    },

    methods: {
        createOrUpdate: async function(word) {
            const updatedWord = await api.updateWord(word);
            alert('Word updated successfully!');
            this.$router.push(`/words/${updatedWord._id}`);
        }
    }
}
</script>