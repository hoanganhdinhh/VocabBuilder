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

const normalizeText = text => (text || '').toLowerCase();

const toVector = text => {
    const vector = new Array(26).fill(0);
    const normalized = normalizeText(text);

    for (const char of normalized) {
        const code = char.charCodeAt(0) - 97;
        if (code >= 0 && code < 26) {
            vector[code] += 1;
        }
    }

    return vector;
};

const cosineSimilarity = (a, b) => {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    return denominator === 0 ? 0 : dot / denominator;
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

exports.search_words = async (req, res) => {
    const searchTerm = normalizeText(req.query.q);
    if (!searchTerm) {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    try {
        const searchVector = toVector(searchTerm);
        const words = await Vocab.find({});

        const ranked = words
            .map(word => {
                const combined = `${word.english} ${word.german} ${word.vietnamese}`;
                return {
                    word,
                    score: cosineSimilarity(searchVector, toVector(combined))
                };
            })
            .filter(entry => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(entry => entry.word);

        return res.json(ranked);
    } catch (error) {
        console.error('Failed to search words', error);
        return res.status(500).json({ message: 'Unable to search words right now' });
    }
};