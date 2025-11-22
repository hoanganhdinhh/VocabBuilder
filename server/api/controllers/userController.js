const mongoose = require('mongoose');
const User = mongoose.model('User');

const sanitizeUser = user => ({
    _id: user._id,
    email: user.email
});

exports.list_all_users = (req, res) => {
    User.find({}, (err, users) => {
        if (err) res.send(err);
        res.json(users.map(sanitizeUser));
    });
};

exports.create_a_user = (req, res) => {
    const newUser = new User(req.body);
    newUser.save((err, user) => {
        if (err) res.send(err);
        res.json(sanitizeUser(user));
    });
};

exports.signup = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const user = new User({ email, password });
        const createdUser = await user.save();

        return res.status(201).json(sanitizeUser(createdUser));
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json(sanitizeUser(user));
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.read_a_user = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(sanitizeUser(user));
    });
};


exports.update_a_user = (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true },
        (err, user) => {
            if (err) return res.send(err);
            res.json(sanitizeUser(user));
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