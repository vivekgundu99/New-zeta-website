// backend/api/papers.js
const { Paper } = require('../models/Content');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');

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

        jwt.verify(token, process.env.JWT_SECRET);

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Get all papers
        if (path === '/api/papers' && req.method === 'GET') {
            const papers = await Paper.find().sort({ createdAt: -1 });
            return res.json(papers);
        }

        // Search papers
        if (path === '/api/papers/search' && req.method === 'GET') {
            const q = url.searchParams.get('q');
            
            const papers = await Paper.find({
                topicName: { $regex: q, $options: 'i' }
            }).sort({ createdAt: -1 });
            
            return res.json(papers);
        }

        res.status(404).json({ message: 'Route not found' });
    } catch (error) {
        console.error('Papers API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};