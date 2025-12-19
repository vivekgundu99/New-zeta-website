// backend/validators/quiz.js
const Joi = require('joi');

const questionSchema = Joi.object({
  question: Joi.string().min(10).max(500).required().trim(),
  optionA: Joi.string().min(1).max(200).required().trim(),
  optionB: Joi.string().min(1).max(200).required().trim(),
  optionC: Joi.string().min(1).max(200).required().trim(),
  optionD: Joi.string().min(1).max(200).required().trim(),
  correctOption: Joi.string().valid('A', 'B', 'C', 'D').required(),
  explanation: Joi.string().max(1000).optional().trim(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const topicSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().trim(),
  description: Joi.string().max(500).optional().trim(),
  order: Joi.number().integer().min(0).optional()
});

const answerSchema = Joi.object({
  questionId: Joi.string().required(),
  answer: Joi.string().valid('A', 'B', 'C', 'D').required(),
  type: Joi.string().valid('daily', 'competitive').required()
});

module.exports = {
  questionSchema,
  topicSchema,
  answerSchema
};