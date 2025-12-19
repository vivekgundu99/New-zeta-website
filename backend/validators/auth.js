// backend/validators/auth.js
const Joi = require('joi');

const signupSchema = Joi.object({
  fullname: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required'
    }),
  
  securityQuestion: Joi.string()
    .valid('pet', 'city', 'school', 'book')
    .required()
    .messages({
      'any.only': 'Invalid security question',
      'any.required': 'Security question is required'
    }),
  
  securityAnswer: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Security answer must be at least 2 characters',
      'any.required': 'Security answer is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  
  password: Joi.string()
    .required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.pattern.base': 'New password must contain uppercase, lowercase, and number'
    })
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  securityQuestion: Joi.string().valid('pet', 'city', 'school', 'book').required(),
  securityAnswer: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
});

module.exports = {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  resetPasswordSchema
};