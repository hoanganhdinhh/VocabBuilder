const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const https = require('https');
const util = require('util');

const pbkdf2 = util.promisify(crypto.pbkdf2);
const randomBytes = util.promisify(crypto.randomBytes);

const mailjetApiKey = '8a6840af9e90cd91075bd16daf41a5f6';
const mailjetApiSecret = '34cd1c55b9c5d9b6f114a58ba3af8f6a';
const mailjetFromEmail = 'no-reply@hoanganhdinh.cloud';
const mailjetFromName = 'VocabBuilder';

const OTP_EXPIRATION_MINUTES = 10;

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
    email: user.email,
    isVerified: user.isVerified
});

const createVerificationCode = () => crypto.randomInt(100000, 1000000).toString();

const setVerificationCode = user => {
    const code = createVerificationCode();
    user.verificationCode = code;
    user.verificationExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    return code;
};

const ensureMailjetIsConfigured = () => {
    if (!mailjetApiKey || !mailjetApiSecret) {
        throw new Error('Mailjet is not configured. Please set MAILJET_API_KEY and MAILJET_API_SECRET.');
    }
    if (!mailjetFromEmail) {
        throw new Error('MAILJET_FROM_EMAIL is required to send emails.');
    }
};

const sendVerificationEmail = async (email, code) => {
    ensureMailjetIsConfigured();

    const payload = JSON.stringify({
        Messages: [
            {
                From: {
                    Email: mailjetFromEmail,
                    Name: mailjetFromName
                },
                To: [
                    {
                        Email: email
                    }
                ],
                Subject: 'Your OTP Code for VocabBuilder',
                TextPart: `Your OTP code is ${code}. The code is valid for ${OTP_EXPIRATION_MINUTES} minutes.`,
                HTMLPart: `<p>Your OTP code is <strong>${code}</strong>.</p><p>The code is valid for ${OTP_EXPIRATION_MINUTES} minutes.</p>`
            }
        ]
    });

    const authHeader = Buffer.from(`${mailjetApiKey}:${mailjetApiSecret}`).toString('base64');

    await new Promise((resolve, reject) => {
        const request = https.request(
            'https://api.mailjet.com/v3.1/send',
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${authHeader}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            },
            response => {
                let data = '';
                response.on('data', chunk => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve();
                        return;
                    }
                    reject(
                        new Error(
                            `Mailjet request failed with status ${response.statusCode}: ${data || response.statusMessage}`
                        )
                    );
                });
            }
        );

        request.on('error', reject);
        request.write(payload);
        request.end();
    });
};

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

            const user = new User({
            email,
            password: await hashPassword(password),
            isVerified: false
        });

        const verificationCode = setVerificationCode(user);
        const createdUser = await user.save();
        await sendVerificationEmail(email, verificationCode);

        return res.status(201).json({
            message: 'Signup successful. Please verify your email with the code sent to you.',
            email: createdUser.email
        });
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


exports.verifyOtp = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.json(sanitizeUser(user));
        }

        const isCodeValid =
            user.verificationCode === code && user.verificationExpiresAt && user.verificationExpiresAt > new Date();

        if (!isCodeValid) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationExpiresAt = undefined;
        await user.save();

        return res.json(sanitizeUser(user));
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const verificationCode = setVerificationCode(user);
        await user.save();
        await sendVerificationEmail(email, verificationCode);

        return res.json({ message: 'A new verification code has been sent to your email.' });
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