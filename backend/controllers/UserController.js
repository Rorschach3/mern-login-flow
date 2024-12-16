const {
    signupSchema,signinSchema
} = require('../middleware/validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const {
    doHash, doHashValidation, hmacProcess
} = require('../utils/hashing');


exports.signup = async (req, res) => {
    const { email, password } = req.body;
    console.log("Signup request received:", { email, password }); // Log the incoming request data

    try {
        const { error, value } = signupSchema.validate({ email, password });
        console.log("Validation result:", { error, value }); // Log validation results

        if (error) {
            console.log("Validation error:", error.details[0].message); // Log validation error details
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        console.log("Existing user lookup result:", existingUser); // Log result of database query

        if (existingUser) {
            console.log("User already exists with email:", email); // Log if user already exists
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await doHash(password, 12);
        console.log("Hashed password generated"); // Log successful password hashing

        const newUser = new User({
            email,
            password: hashedPassword,
        });

        const result = await newUser.save();
        console.log("New user saved to database:", result); // Log the saved user object

        result.password = undefined;
        res.status(201).json({
            success: true, message: "User created successfully", result
        });
    } catch (error) {
        console.error("Error during signup:", error); // Log any unexpected errors
        res.status(500).json({ success: false, message: "Internal server error" }); // Send response for errors
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Signin request received:", { email }); // Log the incoming request data (avoid logging passwords for security)

    try {
        const { error, value } = signinSchema.validate({ email, password });
        console.log("Validation result:", { error, value }); // Log validation results

        if (error) {
            console.log("Validation error:", error.details[0].message); // Log validation error details
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email }).select('+password');
        console.log("Existing user lookup result:", existingUser); // Log result of database query

        if (!existingUser) {
            console.log("No user found with email:", email); // Log if user doesn't exist
            return res
                .status(401)
                .json({ success: false, message: 'User does not exist!' });
        }

        const result = await doHashValidation(password, existingUser.password);
        console.log("Password validation result:", result); // Log result of password validation

        if (!result) {
            console.log("Invalid credentials for user:", email); // Log invalid credentials attempt
            return res
                .status(401)
                .json({ success: false, message: 'Invalid credentials!' });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: '8h',
            }
        );
        console.log("JWT token generated:", token); // Log generated token (useful for debugging, but avoid in production)

        res
            .cookie('Authorization', 'Bearer ' + token, {
                expires: new Date(Date.now() + 8 * 3600000),
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            })
            .json({
                success: true,
                token,
                message: 'logged in successfully',
            });
    } catch (error) {
        console.error("Error during signin:", error); // Log any unexpected errors
        res.status(500).json({ success: false, message: "Internal server error" }); // Send response for errors
    }
};
