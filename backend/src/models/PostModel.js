const Joi = require('joi');


// Password Validation Schema
exports.signupSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: ['com', 'net'] } })
		.required(),
	password: Joi.string()
		.min(8)
		.max(128)
		.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.required()
		.messages({
			"string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
			"string.min": "Password must be at least 8 characters long.",
		}),
});
exports.loginSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	password: Joi.string()
		.required()
		.pattern(new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)),

});

exports.acceptCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	providedCode: Joi.number().required(),
});

exports.changePasswordSchema = Joi.object({
	newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
	oldPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});

exports.acceptFPCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	providedCode: Joi.number().required(),
	newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});

exports.createPostSchema = Joi.object({
	title: Joi.string().min(3).max(60).required(),
	description: Joi.string().min(3).max(600).required(),
	userId: Joi.string().required(),
});
