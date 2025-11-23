const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const util = require('util');

const pbkdf2 = util.promisify(crypto.pbkdf2);
const randomBytes = util.promisify(crypto.randomBytes);

const hashPassword = async password => {
    const salt = (await randomBytes(16)).toString('hex');
    const derivedKey = await pbkdf2(password, salt, 310000, 32, 'sha256');
    return `${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedHash) => {
    if (!storedHash) return false;
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = await pbkdf2(password, salt, 310000, 32, 'sha256');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
};

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

exports.create_a_user = async (req, res) => {
    try {
        const password = req.body.password;
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const newUser = new User({ ...req.body, password: hashedPassword });
        const user = await newUser.save();
        res.json(sanitizeUser(user));
    } catch (err) {
        res.send(err);
    }
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

        const user = new User({ email, password: await hashPassword(password) });
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatches = await verifyPassword(password, user.password);
        if (!passwordMatches) {
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


exports.update_a_user = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.body.password) {
            updates.password = await hashPassword(req.body.password);
        }

        const user = await User.findOneAndUpdate({ _id: req.params.userId }, updates, {
            new: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(sanitizeUser(user));
    } catch (err) {
        return res.send(err);
    }
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