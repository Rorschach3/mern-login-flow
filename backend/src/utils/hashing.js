const bcrypt = require('bcrypt');

// Hash a value (e.g., password)
exports.doHash = async (value, saltRounds = 10) => {
	try {
		const hashedValue = await bcrypt.hash(value, saltRounds);
		return hashedValue;
	} catch (error) {
		console.error('Error hashing value:', error.message);
		throw error;
	}
};

// Validate a value against a hashed value (e.g., password comparison)
exports.doHashValidation = async (value, hashedValue) => {
	try {
		const isMatch = await bcrypt.compare(value, hashedValue);
		return isMatch;
	} catch (error) {
		console.error('Error comparing values:', error.message);
		throw error;
	}
};

// HMAC Process (useful for other cryptographic tasks, like API keys)
const { createHmac } = require('crypto');
exports.hmacProcess = (value, key) => {
	const result = createHmac('sha256', key).update(value).digest('hex');
	return result;
};
