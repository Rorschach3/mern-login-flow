const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: false,
        minLength: [2, 'First name must be at least 2 characters long'],
    },
    lastName: {
        type: String,
        required: false,
        minLength: [2, 'Last name must be at least 2 characters long'],
    },
    username: {
        type: String,
        required: false,
        minLength: [2, 'Username name must be at least 2 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        minLength: [5, 'Email must be at least 5 characters long'],
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
