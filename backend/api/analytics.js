// backend/api/analytics.js
const User = require('../models/user');
const { DailyQuiz, Topic } = require('../models/Quiz');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');
const setCorsHeaders = require('../lib/cors');

module.exports = async (req, res) => {
    if (setCorsHeaders(req, res)) return;

    await connectDB();

    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Get user analytics
        if (path === '/api/analytics/user' && req.method === 'GET') {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Calculate activity data for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activityData = Array(30).fill(0);
            user.quizAnswers.forEach(answer => {
                const answerDate = new Date(answer.answeredAt);
                if (answerDate >= thirtyDaysAgo) {
                    const daysAgo = Math.floor((Date.now() - answerDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysAgo < 30) {
                        activityData[29 - daysAgo]++;
                    }
                }
            });

            // Get topic progress with names
            const topicProgress = await Promise.all(
                user.stats.topicProgress.map(async (tp) => {
                    const topic = await Topic.findById(tp.topicId);
                    return {
                        name: topic ? topic.name : tp.topicName,
                        answered: tp.questionsAnswered,
                        correct: tp.correctAnswers,
                        total: topic ? topic.questions.length : tp.questionsAnswered,
                        accuracy: tp.questionsAnswered > 0 
                            ? Math.round((tp.correctAnswers / tp.questionsAnswered) * 100)
                            : 0
                    };
                })
            );

            // Calculate achievements
            const achievements = [
                {
                    id: 'first_answer',
                    name: 'First Steps',
                    description: 'Answer your first question',
                    icon: '🎯',
                    unlocked: user.stats.totalQuestionsAnswered >= 1
                },
                {
                    id: 'ten_correct',
                    name: 'Getting Started',
                    description: 'Answer 10 questions correctly',
                    icon: '⭐',
                    unlocked: user.stats.correctAnswers >= 10
                },
                {
                    id: 'fifty_correct',
                    name: 'Knowledge Seeker',
                    description: 'Answer 50 questions correctly',
                    icon: '📚',
                    unlocked: user.stats.correctAnswers >= 50
                },
                {
                    id: 'hundred_correct',
                    name: 'Expert',
                    description: 'Answer 100 questions correctly',
                    icon: '🏆',
                    unlocked: user.stats.correctAnswers >= 100
                },
                {
                    id: 'streak_3',
                    name: 'Consistent Learner',
                    description: 'Maintain a 3-day streak',
                    icon: '🔥',
                    unlocked: user.stats.dailyStreak >= 3
                },
                {
                    id: 'streak_7',
                    name: 'Week Warrior',
                    description: 'Maintain a 7-day streak',
                    icon: '💪',
                    unlocked: user.stats.dailyStreak >= 7
                },
                {
                    id: 'streak_30',
                    name: 'Monthly Master',
                    description: 'Maintain a 30-day streak',
                    icon: '👑',
                    unlocked: user.stats.dailyStreak >= 30
                },
                {
                    id: 'accuracy_80',
                    name: 'Sharp Mind',
                    description: 'Achieve 80% accuracy',
                    icon: '🎓',
                    unlocked: user.accuracy >= 80
                },
                {
                    id: 'accuracy_90',
                    name: 'Genius',
                    description: 'Achieve 90% accuracy',
                    icon: '🧠',
                    unlocked: user.accuracy >= 90
                },
                {
                    id: 'all_topics',
                    name: 'Well Rounded',
                    description: 'Answer questions in all topics',
                    icon: '🌟',
                    unlocked: user.stats.topicProgress.length >= 5
                }
            ];

            return res.json({
                accuracy: user.accuracy,
                totalQuestions: user.stats.totalQuestionsAnswered,
                correctAnswers: user.stats.correctAnswers,
                streak: user.stats.dailyStreak,
                longestStreak: user.stats.longestStreak,
                timeSpent: user.stats.totalTimeSpent,
                avgTimePerQuestion: user.avgTimePerQuestion,
                topicProgress,
                activityData,
                achievements,
                rank: null // Will be set by leaderboard position
            });
        }

        // Get leaderboard
        if (path === '/api/analytics/leaderboard' && req.method === 'GET') {
            const limit = parseInt(url.searchParams.get('limit')) || 10;
            const leaderboard = await User.getLeaderboard(limit);

            // Find current user's position
            const user = await User.findById(userId);
            const userScore = (user.stats.correctAnswers * 10) + (user.stats.dailyStreak * 5);
            
            const userPosition = await User.countDocuments({
                isActive: true,
                $or: [
                    { 'stats.correctAnswers': { $gt: user.stats.correctAnswers } },
                    {
                        'stats.correctAnswers': user.stats.correctAnswers,
                        'stats.dailyStreak': { $gt: user.stats.dailyStreak }
                    }
                ]
            }) + 1;

            return res.json({
                leaderboard,
                userPosition,
                userScore
            });
        }

        // Get topic leaderboard
        if (path.match(/^\/api\/analytics\/leaderboard\/topic\/[a-f0-9]{24}$/) && req.method === 'GET') {
            const topicId = path.split('/').pop();
            const limit = parseInt(url.searchParams.get('limit')) || 10;
            
            const leaderboard = await User.getTopicLeaderboard(topicId, limit);

            return res.json({ leaderboard });
        }

        // Get weekly summary
        if (path === '/api/analytics/weekly-summary' && req.method === 'GET') {
            const user = await User.findById(userId);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const weekAnswers = user.quizAnswers.filter(
                a => new Date(a.answeredAt) >= sevenDaysAgo
            );

            const summary = {
                questionsAnswered: weekAnswers.length,
                correctAnswers: weekAnswers.filter(a => a.isCorrect).length,
                accuracy: weekAnswers.length > 0
                    ? Math.round((weekAnswers.filter(a => a.isCorrect).length / weekAnswers.length) * 100)
                    : 0,
                averageTime: weekAnswers.length > 0
                    ? Math.round(weekAnswers.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / weekAnswers.length)
                    : 0,
                streakMaintained: user.stats.dailyStreak >= 7,
                topicsExplored: new Set(weekAnswers.map(a => a.questionId)).size
            };

            return res.json(summary);
        }

        res.status(404).json({ message: 'Route not found' });
    } catch (error) {
        console.error('Analytics API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};