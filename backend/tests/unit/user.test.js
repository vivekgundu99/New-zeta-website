// backend/tests/unit/user.test.js
const User = require('../../models/user');
const mongoose = require('mongoose');

describe('User Model Tests', () => {
    describe('User Creation', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                fullname: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            };

            const user = await User.create(userData);

            expect(user._id).toBeDefined();
            expect(user.fullname).toBe(userData.fullname);
            expect(user.email).toBe(userData.email.toLowerCase());
            expect(user.password).not.toBe(userData.password);
        });

        it('should not create user with duplicate email', async () => {
            const userData = {
                fullname: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            };

            await User.create(userData);
            await expect(User.create(userData)).rejects.toThrow();
        });

        it('should validate email format', async () => {
            const userData = {
                fullname: 'Test User',
                email: 'invalid-email',
                password: 'Password123',
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            };

            await expect(User.create(userData)).rejects.toThrow();
        });
    });

    describe('Password Handling', () => {
        it('should hash password before saving', async () => {
            const password = 'Password123';
            const user = await User.create({
                fullname: 'Test User',
                email: 'test@example.com',
                password,
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            });

            expect(user.password).not.toBe(password);
            expect(user.password.length).toBeGreaterThan(20);
        });

        it('should compare passwords correctly', async () => {
            const password = 'Password123';
            const user = await User.create({
                fullname: 'Test User',
                email: 'test@example.com',
                password,
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            });

            const userWithPassword = await User.findById(user._id).select('+password');
            const isMatch = await userWithPassword.comparePassword(password);
            expect(isMatch).toBe(true);

            const isNotMatch = await userWithPassword.comparePassword('WrongPassword');
            expect(isNotMatch).toBe(false);
        });
    });

    describe('Quiz Statistics', () => {
        it('should update quiz stats correctly', async () => {
            const user = await User.create({
                fullname: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            });

            const questionId = new mongoose.Types.ObjectId();
            await user.updateQuizStats(questionId, 'A', 'A', 'daily', 10);

            expect(user.stats.totalQuestionsAnswered).toBe(1);
            expect(user.stats.correctAnswers).toBe(1);
            expect(user.stats.dailyStreak).toBe(1);
        });

        it('should calculate accuracy correctly', async () => {
            const user = await User.create({
                fullname: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                securityQuestion: 'pet',
                securityAnswer: 'fluffy'
            });

            for (let i = 0; i < 5; i++) {
                const questionId = new mongoose.Types.ObjectId();
                const correct = i < 3;
                await user.updateQuizStats(
                    questionId,
                    correct ? 'A' : 'B',
                    'A',
                    'daily',
                    10
                );
            }

            expect(user.accuracy).toBe(60);
        });
    });
});