const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: 'Email cannot be blank'
        },
        password: {
            type: String,
            required: 'Password cannot be blank'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationCode: {
            type: String
        },
        verificationExpiresAt: {
            type: Date
        }
    },
    { collection: 'users' }
);

module.exports = mongoose.model('User', UserSchema);