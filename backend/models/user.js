// backend/models/user.js - COMPLETE REPLACEMENT
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quizAnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    answer: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    },
    type: {
        type: String,
        enum: ['daily', 'competitive'],
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    answeredAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    }
});

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        select: false
    },
    securityQuestion: {
        type: String,
        required: [true, 'Security question is required'],
        enum: ['pet', 'city', 'school', 'book']
    },
    securityAnswer: {
        type: String,
        required: [true, 'Security answer is required'],
        select: false
    },
    quizAnswers: [quizAnswerSchema],
    
    // Analytics and Stats
    stats: {
        totalQuestionsAnswered: {
            type: Number,
            default: 0,
            min: 0
        },
        correctAnswers: {
            type: Number,
            default: 0,
            min: 0
        },
        dailyStreak: {
            type: Number,
            default: 0,
            min: 0
        },
        longestStreak: {
            type: Number,
            default: 0,
            min: 0
        },
        lastAnsweredDate: {
            type: Date
        },
        totalTimeSpent: {
            type: Number, // in seconds
            default: 0
        },
        topicProgress: [{
            topicId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Topic'
            },
            topicName: String,
            questionsAnswered: {
                type: Number,
                default: 0
            },
            correctAnswers: {
                type: Number,
                default: 0
            },
            lastAnswered: Date
        }]
    },
    
    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    
    // Security Fields
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    
    // Preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        reminderTime: String
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for Performance
userSchema.index({ email: 1 });
userSchema.index({ 'quizAnswers.questionId': 1 });
userSchema.index({ 'quizAnswers.answeredAt': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.dailyStreak': -1 });

// Virtual: Accuracy Percentage
userSchema.virtual('accuracy').get(function() {
    if (this.stats.totalQuestionsAnswered === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.totalQuestionsAnswered) * 100);
});

// Virtual: Is Account Locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual: Average Time Per Question
userSchema.virtual('avgTimePerQuestion').get(function() {
    if (this.stats.totalQuestionsAnswered === 0) return 0;
    return Math.round(this.stats.totalTimeSpent / this.stats.totalQuestionsAnswered);
});

// Pre-save Middleware
userSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        // Update stats when quiz answers change
        if (this.isModified('quizAnswers')) {
            this.stats.totalQuestionsAnswered = this.quizAnswers.length;
            this.stats.correctAnswers = this.quizAnswers.filter(a => a.isCorrect).length;
            
            // Update total time spent
            this.stats.totalTimeSpent = this.quizAnswers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
        }
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        if (this.securityAnswer && this.isModified('securityAnswer')) {
            this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase(), salt);
        }
        
        // Set password changed timestamp
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Instance Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareSecurityAnswer = async function(candidateAnswer) {
    return await bcrypt.compare(candidateAnswer.toLowerCase(), this.securityAnswer);
};

userSchema.methods.incrementLoginAttempts = function() {
    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    
    // Increment attempts
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours
    
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }
    
    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

userSchema.methods.updateQuizStats = async function(questionId, answer, correctOption, type, timeTaken = 0) {
    const isCorrect = answer === correctOption;
    
    // Add quiz answer
    this.quizAnswers.push({
        questionId,
        answer,
        type,
        isCorrect,
        answeredAt: new Date(),
        timeTaken
    });
    
    // Update daily streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastAnswered = this.stats.lastAnsweredDate 
        ? new Date(this.stats.lastAnsweredDate).setHours(0, 0, 0, 0)
        : null;
    
    if (lastAnswered) {
        const daysDiff = Math.floor((today - lastAnswered) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            this.stats.dailyStreak += 1;
            if (this.stats.dailyStreak > this.stats.longestStreak) {
                this.stats.longestStreak = this.stats.dailyStreak;
            }
        } else if (daysDiff > 1) {
            this.stats.dailyStreak = 1;
        }
    } else {
        this.stats.dailyStreak = 1;
    }
    
    this.stats.lastAnsweredDate = new Date();
    
    return this.save();
};

userSchema.methods.updateTopicProgress = function(topicId, topicName, isCorrect) {
    const topicProgress = this.stats.topicProgress.find(
        tp => tp.topicId.toString() === topicId.toString()
    );
    
    if (topicProgress) {
        topicProgress.questionsAnswered += 1;
        if (isCorrect) topicProgress.correctAnswers += 1;
        topicProgress.lastAnswered = new Date();
    } else {
        this.stats.topicProgress.push({
            topicId,
            topicName,
            questionsAnswered: 1,
            correctAnswers: isCorrect ? 1 : 0,
            lastAnswered: new Date()
        });
    }
};

// Static Methods
userSchema.statics.getLeaderboard = async function(limit = 10) {
    return this.aggregate([
        { $match: { isActive: true, 'stats.totalQuestionsAnswered': { $gt: 0 } } },
        {
            $project: {
                fullname: 1,
                accuracy: {
                    $cond: [
                        { $eq: ['$stats.totalQuestionsAnswered', 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ['$stats.correctAnswers', '$stats.totalQuestionsAnswered'] },
                                100
                            ]
                        }
                    ]
                },
                totalAnswered: '$stats.totalQuestionsAnswered',
                correctAnswers: '$stats.correctAnswers',
                streak: '$stats.dailyStreak',
                longestStreak: '$stats.longestStreak',
                score: {
                    $add: [
                        { $multiply: ['$stats.correctAnswers', 10] }, // 10 points per correct
                        { $multiply: ['$stats.dailyStreak', 5] } // 5 points per streak day
                    ]
                }
            }
        },
        { $sort: { score: -1, accuracy: -1, totalAnswered: -1 } },
        { $limit: limit }
    ]);
};

userSchema.statics.getTopicLeaderboard = async function(topicId, limit = 10) {
    return this.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$stats.topicProgress' },
        { $match: { 'stats.topicProgress.topicId': new mongoose.Types.ObjectId(topicId) } },
        {
            $project: {
                fullname: 1,
                questionsAnswered: '$stats.topicProgress.questionsAnswered',
                correctAnswers: '$stats.topicProgress.correctAnswers',
                accuracy: {
                    $cond: [
                        { $eq: ['$stats.topicProgress.questionsAnswered', 0] },
                        0,
                        {
                            $multiply: [
                                { 
                                    $divide: [
                                        '$stats.topicProgress.correctAnswers', 
                                        '$stats.topicProgress.questionsAnswered'
                                    ] 
                                },
                                100
                            ]
                        }
                    ]
                }
            }
        },
        { $sort: { correctAnswers: -1, accuracy: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('User', userSchema);