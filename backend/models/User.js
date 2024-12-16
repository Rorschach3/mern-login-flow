const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        minLength: [5, 'Email must be at least 5 characters long'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    verificationTokenValidation: {
        type: String,
        select: false,
    },
    forgotPasswordCode: {
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation: {
        type: String,
        select: false,
    },
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
