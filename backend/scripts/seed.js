// backend/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { DailyQuiz, Topic } = require('../models/Quiz');
const User = require('../models/user');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await DailyQuiz.deleteMany({});
        await Topic.deleteMany({});
        console.log('Cleared existing data');

        // Create sample daily quiz
        await DailyQuiz.create({
            question: 'What is the chemical formula for water?',
            optionA: 'H2O',
            optionB: 'CO2',
            optionC: 'O2',
            optionD: 'H2',
            correctOption: 'A',
            explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.',
            difficulty: 'easy'
        });
        console.log('Created daily quiz');

        // Create sample topics
        const chemistryTopic = await Topic.create({
            name: 'Chemistry Basics',
            description: 'Fundamental chemistry concepts',
            questions: [
                {
                    question: 'What is the atomic number of Carbon?',
                    optionA: '6',
                    optionB: '12',
                    optionC: '8',
                    optionD: '14',
                    correctOption: 'A',
                    difficulty: 'easy'
                },
                {
                    question: 'Which element has the symbol Fe?',
                    optionA: 'Iron',
                    optionB: 'Fluorine',
                    optionC: 'Fermium',
                    optionD: 'Francium',
                    correctOption: 'A',
                    difficulty: 'medium'
                }
            ]
        });

        const physicsTopic = await Topic.create({
            name: 'Physics Fundamentals',
            description: 'Basic physics principles',
            questions: [
                {
                    question: 'What is the speed of light in vacuum?',
                    optionA: '300,000 km/s',
                    optionB: '150,000 km/s',
                    optionC: '450,000 km/s',
                    optionD: '600,000 km/s',
                    correctOption: 'A',
                    difficulty: 'easy'
                }
            ]
        });

        console.log('Created topics');

        // Create admin user if doesn't exist
        const adminExists = await User.findOne({ email: 'admin@zeta.com' });
        if (!adminExists) {
            await User.create({
                fullname: 'Admin User',
                email: 'admin@zeta.com',
                password: 'Admin@123',
                role: 'admin',
                securityQuestion: 'pet',
                securityAnswer: 'admin'
            });
            console.log('Created admin user');
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();