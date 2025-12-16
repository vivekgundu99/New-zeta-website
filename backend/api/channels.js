// backend/api/channels.js
const { Channel } = require('../models/Content');
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

        if (req.method === 'GET') {
            const channels = await Channel.find().sort({ createdAt: -1 });
            
            // Return channels with URLs exactly as stored - NO MODIFICATION
            return res.json(channels);
        }

        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Channels API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};