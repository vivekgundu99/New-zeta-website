// backend/tests/integration/quiz.test.js
const { DailyQuiz, Topic } = require('../../models/Quiz');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

describe('Quiz Integration Tests', () => {
    let authToken;
    let user;

    beforeEach(async () => {
        user = await User.create({
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
            securityQuestion: 'pet',
            securityAnswer: 'fluffy'
        });

        authToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '7d' }
        );
    });

    describe('Daily Quiz', () => {
        it('should create daily quiz', async () => {
            const quiz = await DailyQuiz.create({
                question: 'What is H2O?',
                optionA: 'Water',
                optionB: 'Oxygen',
                optionC: 'Hydrogen',
                optionD: 'Carbon',
                correctOption: 'A'
            });

            expect(quiz._id).toBeDefined();
            expect(quiz.question).toBe('What is H2O?');
        });

        it('should retrieve daily quiz', async () => {
            await DailyQuiz.create({
                question: 'What is H2O?',
                optionA: 'Water',
                optionB: 'Oxygen',
                optionC: 'Hydrogen',
                optionD: 'Carbon',
                correctOption: 'A'
            });

            const quiz = await DailyQuiz.findOne().sort({ createdAt: -1 });
            expect(quiz).toBeDefined();
            expect(quiz.question).toBe('What is H2O?');
        });
    });

    describe('Topic Quiz', () => {
        it('should create topic with questions', async () => {
            const topic = await Topic.create({
                name: 'Chemistry',
                questions: [
                    {
                        question: 'What is H2O?',
                        optionA: 'Water',
                        optionB: 'Oxygen',
                        optionC: 'Hydrogen',
                        optionD: 'Carbon',
                        correctOption: 'A'
                    }
                ]
            });

            expect(topic._id).toBeDefined();
            expect(topic.questions.length).toBe(1);
            expect(topic.slug).toBe('chemistry');
        });

        it('should add question to existing topic', async () => {
            const topic = await Topic.create({
                name: 'Chemistry',
                questions: []
            });

            topic.questions.push({
                question: 'What is H2O?',
                optionA: 'Water',
                optionB: 'Oxygen',
                optionC: 'Hydrogen',
                optionD: 'Carbon',
                correctOption: 'A'
            });

            await topic.save();

            const updatedTopic = await Topic.findById(topic._id);
            expect(updatedTopic.questions.length).toBe(1);
        });
    });
});