// backend/api/admin.js
const { DailyQuiz, Topic } = require('../models/Quiz');
const { Paper, Channel, App, Help } = require('../models/Content');
const User = require('../models/user');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');

// Admin authentication middleware
async function verifyAdmin(req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        throw new Error('No authentication token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.email !== 'admin@zeta.com') {
        throw new Error('Access denied. Admin only.');
    }

    return user;
}

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
        // Verify admin
        await verifyAdmin(req);

        const { pathname } = new URL(req.url, `http://${req.headers.host}`);
        const path = pathname.replace('/api/admin', '');

        // Daily Quiz Management
        if (path === '/quiz/daily' && req.method === 'POST') {
            await DailyQuiz.deleteMany({});
            const dailyQuiz = new DailyQuiz(req.body);
            await dailyQuiz.save();
            return res.status(201).json(dailyQuiz);
        }

        if (path.match(/^\/quiz\/daily\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const dailyQuiz = await DailyQuiz.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(dailyQuiz);
        }

        if (path.match(/^\/quiz\/daily\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await DailyQuiz.findByIdAndDelete(id);
            return res.json({ message: 'Daily quiz deleted' });
        }

        // Topics Management
        if (path === '/quiz/topic' && req.method === 'POST') {
            const topic = new Topic(req.body);
            await topic.save();
            return res.status(201).json(topic);
        }

        if (path.match(/^\/quiz\/topic\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Topic.findByIdAndDelete(id);
            return res.json({ message: 'Topic deleted' });
        }

        // Questions Management
        if (path.match(/^\/quiz\/topic\/[a-f0-9]{24}\/question$/) && req.method === 'POST') {
            const topicId = path.split('/')[3];
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            topic.questions.push(req.body);
            await topic.save();
            return res.status(201).json(topic);
        }

        if (path.match(/^\/quiz\/topic\/[a-f0-9]{24}\/question\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const parts = path.split('/');
            const topicId = parts[3];
            const questionId = parts[5];
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            topic.questions.pull(questionId);
            await topic.save();
            return res.json({ message: 'Question deleted' });
        }

        // Papers Management
        if (path === '/papers' && req.method === 'POST') {
            const paper = new Paper(req.body);
            await paper.save();
            return res.status(201).json(paper);
        }

        if (path.match(/^\/papers\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const paper = await Paper.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(paper);
        }

        if (path.match(/^\/papers\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Paper.findByIdAndDelete(id);
            return res.json({ message: 'Paper deleted' });
        }

        // Channels Management - CRITICAL: Store URLs exactly as received
        if (path === '/channels' && req.method === 'POST') {
            // DO NOT modify photoUrl - store exactly as received
            const channelData = {
                name: req.body.name,
                description: req.body.description,
                url: req.body.url,
                photoUrl: req.body.photoUrl || '' // Store empty string if not provided
            };
            const channel = new Channel(channelData);
            await channel.save();
            console.log('Saved channel with photoUrl:', channel.photoUrl); // Debug log
            return res.status(201).json(channel);
        }

        if (path.match(/^\/channels\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            // DO NOT modify photoUrl - store exactly as received
            const updateData = {
                name: req.body.name,
                description: req.body.description,
                url: req.body.url,
                photoUrl: req.body.photoUrl || ''
            };
            const channel = await Channel.findByIdAndUpdate(id, updateData, { new: true });
            console.log('Updated channel with photoUrl:', channel.photoUrl); // Debug log
            return res.json(channel);
        }

        if (path.match(/^\/channels\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Channel.findByIdAndDelete(id);
            return res.json({ message: 'Channel deleted' });
        }

        // Apps Management - CRITICAL: Store URLs exactly as received
        if (path === '/apps' && req.method === 'POST') {
            // DO NOT modify photoUrl - store exactly as received
            const appData = {
                name: req.body.name,
                features: req.body.features,
                downloadUrl: req.body.downloadUrl,
                photoUrl: req.body.photoUrl || '' // Store empty string if not provided
            };
            const app = new App(appData);
            await app.save();
            console.log('Saved app with photoUrl:', app.photoUrl); // Debug log
            return res.status(201).json(app);
        }

        if (path.match(/^\/apps\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            // DO NOT modify photoUrl - store exactly as received
            const updateData = {
                name: req.body.name,
                features: req.body.features,
                downloadUrl: req.body.downloadUrl,
                photoUrl: req.body.photoUrl || ''
            };
            const app = await App.findByIdAndUpdate(id, updateData, { new: true });
            console.log('Updated app with photoUrl:', app.photoUrl); // Debug log
            return res.json(app);
        }

        if (path.match(/^\/apps\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await App.findByIdAndDelete(id);
            return res.json({ message: 'App deleted' });
        }

        // Help Management
        if (path === '/help' && req.method === 'POST') {
            await Help.deleteMany({});
            const help = new Help(req.body);
            await help.save();
            return res.status(201).json(help);
        }

        if (path.match(/^\/help\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const help = await Help.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(help);
        }

        if (path.match(/^\/help\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Help.findByIdAndDelete(id);
            return res.json({ message: 'Help deleted' });
        }

        res.status(404).json({ message: 'Admin route not found' });
    } catch (error) {
        console.error('Admin API Error:', error);
        if (error.message.includes('Admin only') || error.message.includes('authentication')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};