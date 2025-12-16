// routes/help.js
const express = require('express');
const router = express.Router();
const { Help } = require('../models/Content');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const help = await Help.findOne().sort({ updatedAt: -1 });
        res.json(help || {});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching help' });
    }
});

module.exports = router;