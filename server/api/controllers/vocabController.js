const mongoose = require('mongoose');
const Vocab = mongoose.model('Vocab');

const translateText = async (text, targetLanguage) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
    }
    const payload = await response.json();
    if (!payload?.responseData?.translatedText) {
        throw new Error('Translation response did not include translatedText');
    }
    return payload.responseData.translatedText;
};


exports.list_all_words = (req, res) => {
    Vocab.find({}, (err, words) => {
        if (err) res.send(err);
        res.json(words);
    });
};

exports.create_a_word = (req, res) => {
    const newWord = new Vocab(req.body);
    newWord.save((err, word) => {
        if (err) res.send(err);
        res.json(word);
    });
};

// exports.read_a_word = (req, res) => {
//     Vocab.findById(req.params.wordId, (err, word) => {
//         if (err) res.send(err);
//         res.json(word);
//     });
// };

exports.read_a_word = (req, res) => {
    Vocab.findById(req.params.wordId, (err, word) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }
        return res.json(word);
    });
};


exports.update_a_word = (req, res) => {
    Vocab.findOneAndUpdate(
        { _id: req.params.wordId },
        req.body,
        { new: true },
        (err, word) => {
            if (err) return res.send(err);
            res.json(word);
        }
    );
};

exports.delete_a_word = (req, res) => {
    Vocab.deleteOne({ _id: req.params.wordId }, err => {
        if (err) return res.send(err);
        res.json({
            message: 'Word successfully deleted',
            _id: req.params.wordId
        });
    });
};

exports.suggest_translations = async (req, res) => {
    const { english } = req.body;
    if (!english) {
        return res.status(400).json({ message: 'English word is required to generate suggestions' });
    }

    try {
        const [german, vietnamese] = await Promise.all([
            translateText(english, 'de'),
            translateText(english, 'vi')
        ]);

        res.json({ german, vietnamese });
    } catch (error) {
        console.error('Failed to translate word', error);
        res.status(500).json({ message: 'Unable to generate suggestions right now' });
    }
};