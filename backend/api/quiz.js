// backend/api/quiz.js
const { DailyQuiz, Topic } = require('../models/Quiz');
const User = require('../models/user');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');

// Helper to parse JSON body
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await connectDB();

    try {
        // Verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Get daily quiz
        if (path === '/api/quiz/daily' && req.method === 'GET') {
            const dailyQuiz = await DailyQuiz.findOne().sort({ createdAt: -1 });
            return res.json(dailyQuiz);
        }

        // Get all topics
        if (path === '/api/quiz/topics' && req.method === 'GET') {
            const topics = await Topic.find().select('_id name');
            return res.json(topics);
        }

        // Get topic with questions
        if (path.match(/^\/api\/quiz\/topic\/[a-f0-9]{24}$/) && req.method === 'GET') {
            const topicId = path.split('/').pop();
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            return res.json(topic);
        }

        // Submit quiz answer
        if (path === '/api/quiz/answer' && req.method === 'POST') {
            const body = await parseBody(req);
            const { questionId, answer, type } = body;

            const user = await User.findById(userId);

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

            return res.json({ message: 'Answer submitted successfully' });
        }

        // Get user answer for a question
        if (path === '/api/quiz/user-answer' && req.method === 'GET') {
            const type = url.searchParams.get('type');
            const questionId = url.searchParams.get('questionId');

            const user = await User.findById(userId);

            const answer = user.quizAnswers.find(
                a => a.questionId.toString() === questionId && a.type === type
            );

            if (answer) {
                return res.json({ answer: answer.answer });
            } else {
                return res.status(404).json({ message: 'Answer not found' });
            }
        }

        res.status(404).json({ message: 'Route not found' });
    } catch (error) {
        console.error('Quiz API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};