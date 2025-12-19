// backend/models/Quiz.js - COMPLETE REPLACEMENT
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        minlength: [10, 'Question must be at least 10 characters']
    },
    optionA: {
        type: String,
        required: [true, 'Option A is required'],
        trim: true
    },
    optionB: {
        type: String,
        required: [true, 'Option B is required'],
        trim: true
    },
    optionC: {
        type: String,
        required: [true, 'Option C is required'],
        trim: true
    },
    optionD: {
        type: String,
        required: [true, 'Option D is required'],
        trim: true
    },
    correctOption: {
        type: String,
        required: [true, 'Correct option is required'],
        enum: {
            values: ['A', 'B', 'C', 'D'],
            message: 'Correct option must be A, B, C, or D'
        }
    },
    explanation: {
        type: String,
        trim: true,
        maxlength: [1000, 'Explanation cannot exceed 1000 characters']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [String],
    stats: {
        timesAnswered: {
            type: Number,
            default: 0,
            min: 0
        },
        correctCount: {
            type: Number,
            default: 0,
            min: 0
        },
        avgTimeTaken: {
            type: Number, // in seconds
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for question accuracy
questionSchema.virtual('accuracy').get(function() {
    if (this.stats.timesAnswered === 0) return 0;
    return Math.round((this.stats.correctCount / this.stats.timesAnswered) * 100);
});

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Topic name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Topic name must be at least 3 characters'],
        maxlength: [100, 'Topic name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
        type: String,
        default: '📚'
    },
    questions: [questionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    stats: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        totalCompletions: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
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

// Create slug before saving
topicSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    }
    next();
});

// Indexes
topicSchema.index({ name: 1 });
topicSchema.index({ slug: 1 });
topicSchema.index({ isActive: 1, order: 1 });

// Virtual for question count
topicSchema.virtual('questionCount').get(function() {
    return this.questions.filter(q => q.isActive).length;
});

// Virtual for average difficulty
topicSchema.virtual('avgDifficulty').get(function() {
    const difficulties = { easy: 1, medium: 2, hard: 3 };
    const activeQuestions = this.questions.filter(q => q.isActive);
    if (activeQuestions.length === 0) return 'medium';
    
    const avg = activeQuestions.reduce((sum, q) => sum + difficulties[q.difficulty], 0) / activeQuestions.length;
    
    if (avg <= 1.5) return 'easy';
    if (avg <= 2.5) return 'medium';
    return 'hard';
});

// Daily Quiz Schema
const dailyQuizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    optionA: { type: String, required: true, trim: true },
    optionB: { type: String, required: true, trim: true },
    optionC: { type: String, required: true, trim: true },
    optionD: { type: String, required: true, trim: true },
    correctOption: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    },
    explanation: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    date: {
        type: Date,
        default: () => {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        },
        index: true
    },
    stats: {
        timesAnswered: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for finding today's quiz
dailyQuizSchema.index({ date: -1 });

// Virtual for accuracy
dailyQuizSchema.virtual('accuracy').get(function() {
    if (this.stats.timesAnswered === 0) return 0;
    return Math.round((this.stats.correctCount / this.stats.timesAnswered) * 100);
});

const DailyQuiz = mongoose.model('DailyQuiz', dailyQuizSchema);
const Topic = mongoose.model('Topic', topicSchema);

module.exports = { DailyQuiz, Topic };