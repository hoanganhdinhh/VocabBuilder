const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.list_all_users = (req, res) => {
    User.find({}, (err, users) => {
        if (err) res.send(err);
        res.json(users);
    });
};

exports.create_a_user = (req, res) => {
    const newUser = new User(req.body);
    newUser.save((err, user) => {
        if (err) res.send(err);
        res.json(user);
    });
};

// exports.read_a_word = (req, res) => {
//     Vocab.findById(req.params.wordId, (err, word) => {
//         if (err) res.send(err);
//         res.json(word);
//     });
// };

exports.read_a_user = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    });
};


exports.update_a_user = (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true },
        (err, user) => {
            if (err) return res.send(err);
            res.json(user);
        }
    );
};

exports.delete_a_user = (req, res) => {
    User.deleteOne({ _id: req.params.userId }, err => {
        if (err) return res.send(err);
        res.json({
            message: 'User successfully deleted',
            _id: req.params.userId
        });
    });
};