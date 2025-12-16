// routes/papers.js
const express = require('express');
const router = express.Router();
const { Paper } = require('../models/Content');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const papers = await Paper.find().sort({ createdAt: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching papers' });
    }
});

router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        const papers = await Paper.find({
            topicName: { $regex: q, $options: 'i' }
        }).sort({ createdAt: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: 'Error searching papers' });
    }
});

module.exports = router;
