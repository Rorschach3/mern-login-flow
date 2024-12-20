const jwt = require('jsonwebtoken');
const {
    signupSchema, loginSchema, acceptCodeSchema, changePasswordSchema, acceptFPCodeSchema,
} = require('../middleware/validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const {
    doHash, doHashValidation, hmacProcess
} = require('../utils/hashing');
const transport = require('../middleware/sendMail');

// Function: signup
exports.signup = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    console.log("Signup request received:", { firstName, lastName, username, email, password });
    console.log('SignupSchema:', signupSchema);

    try {
        const { error } = signupSchema.validate({ firstName, lastName, username, email, password });
        if (error) {
            console.log("Validation error:", error.details[0].message);
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await doHash(password, 12);
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        const result = await newUser.save();
        result.password = undefined; // Remove password before sending response
        res.status(201).json({ success: true, message: "User created successfully", result });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Function: login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request received:", { email }); // Log the incoming request data (excluding password)

    try {
        // Validate the login schema for email and password
        const { error, value } = loginSchema.validate({ email, password });
        console.log("Validation result:", { error, value });

        if (error) {
            console.log("Validation error:", error.details[0].message);
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        // Lookup the user in the database and select the password
        const existingUser = await User.findOne({ email }).select('+password');
        console.log("Existing user lookup result:", existingUser);

        if (!existingUser) {
            console.log("No user found with email:", email);
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        // Validate the provided password against the hashed password
        const result = await doHashValidation(password, existingUser.password);
        console.log("Password validation result:", result);

        if (!result) {
            console.log("Invalid credentials for user:", email);
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }

        // Generate a JWT token containing user details
        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                verified: existingUser.verified,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '8h' }
        );
        console.log("JWT token generated:", token);

        // Set a cookie with the token, expiration, and security settings
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        }).json({
            success: true,
            token,
            message: 'logged in successfully',
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Function: signout
exports.signout = async (req, res) => {
    // Clear the Authorization cookie
    res.clearCookie('Authorization').status(200).json({
        success: true, message: 'logged out successfully'
    });
};

// Function: sendVerificationCode
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        // Check if the user exists in the database
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User does not exist!' });
        }

        // If the user is already verified
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'You are already verified!' });
        }

        // Generate a verification code and send it via email
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        // Update the user's verification details
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();

        res.status(200).json({ success: true, message: 'Verification code sent!' });
    } catch (error) {
        console.error("Error during sendVerificationCode:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.verifyVerificationCode = async (req, res) => {
	const { email, providedCode } = req.body;
	try {
		const { error, value } = acceptCodeSchema.validate({ email, providedCode });
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+verificationCode +verificationCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
		if (existingUser.verified) {
			return res
				.status(400)
				.json({ success: false, message: 'you are already verified!' });
		}

		if (
			!existingUser.verificationCode ||
			!existingUser.verificationCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_VERIFICATION_CODE_SECRET
		);

		if (hashedCodeValue === existingUser.verificationCode) {
			existingUser.verified = true;
			existingUser.verificationCode = undefined;
			existingUser.verificationCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'your account has been verified!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};

// Function: changePassword
exports.changePassword = async (req, res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body;
    try {
        // Validate input parameters for old and new passwords
        const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        // Check if the user is verified
        if (!verified) {
            return res.status(401).json({ success: false, message: 'You are not a verified user!' });
        }

        // Retrieve the user details including the password
        const existingUser = await User.findOne({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User does not exist!' });
        }

        // Validate old password
        const result = await doHashValidation(oldPassword, existingUser.password);
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }

        // Hash the new password and save it to the database
        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.status(200).json({ success: true, message: 'Password updated successfully!' });
    } catch (error) {
        console.error("Error during changePassword:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.sendForgotPasswordCode = async (req, res) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'Forgot password code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				process.env.HMAC_VERIFICATION_CODE_SECRET
			);
			existingUser.forgotPasswordCode = hashedCodeValue;
			existingUser.forgotPasswordCodeValidation = Date.now();
			await existingUser.save();
			return res.status(200).json({ success: true, message: 'Code sent!' });
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};
exports.verifyForgotPasswordCode = async (req, res) => {
	const { email, providedCode, newPassword } = req.body;
	try {
		const { error, value } = acceptFPCodeSchema.validate({
			email,
			providedCode,
			newPassword,
		});
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+forgotPasswordCode +forgotPasswordCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}

		if (
			!existingUser.forgotPasswordCode ||
			!existingUser.forgotPasswordCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (
			Date.now() - existingUser.forgotPasswordCodeValidation >
			5 * 60 * 1000
		) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_VERIFICATION_CODE_SECRET
		);

		if (hashedCodeValue === existingUser.forgotPasswordCode) {
			const hashedPassword = await doHash(newPassword, 12);
			existingUser.password = hashedPassword;
			existingUser.forgotPasswordCode = undefined;
			existingUser.forgotPasswordCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'Password updated!!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};
