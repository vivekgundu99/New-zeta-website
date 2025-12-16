const express = require('express');
const router = express.Router();
const { DailyQuiz, Topic } = require('../models/Quiz');
const User = require('../models/user');
const { auth } = require('../middleware/auth');

// Get daily quiz
router.get('/daily', auth, async (req, res) => {
    try {
        const dailyQuiz = await DailyQuiz.findOne().sort({ createdAt: -1 });
        res.json(dailyQuiz);
    } catch (error) {
        console.error('Error fetching daily quiz:', error);
        res.status(500).json({ message: 'Error fetching daily quiz' });
    }
});

// Get all topics
router.get('/topics', auth, async (req, res) => {
    try {
        const topics = await Topic.find().select('_id name');
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics' });
    }
});

// Get topic with questions
router.get('/topic/:topicId', auth, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        res.json(topic);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ message: 'Error fetching topic' });
    }
});

// Submit quiz answer
router.post('/answer', auth, async (req, res) => {
    try {
        const { questionId, answer, type } = req.body;

        const user = await User.findById(req.userId);

        // Check if already answered
        const existingAnswer = user.quizAnswers.find(
            a => a.questionId.toString() === questionId && a.type === type
        );

        if (existingAnswer) {
            return res.status(400).json({ message: 'Question already answered' });
        }

        // Add answer
        user.quizAnswers.push({
            questionId,
            answer,
            type
        });

        await user.save();

        res.json({ message: 'Answer submitted successfully' });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Error submitting answer' });
    }
});

// Get user answer for a question
router.get('/user-answer', auth, async (req, res) => {
    try {
        const { type, questionId } = req.query;

        const user = await User.findById(req.userId);

        const answer = user.quizAnswers.find(
            a => a.questionId.toString() === questionId && a.type === type
        );

        if (answer) {
            res.json({ answer: answer.answer });
        } else {
            res.status(404).json({ message: 'Answer not found' });
        }
    } catch (error) {
        console.error('Error fetching user answer:', error);
        res.status(500).json({ message: 'Error fetching user answer' });
    }
});

module.exports = router;