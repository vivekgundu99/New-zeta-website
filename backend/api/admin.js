// backend/api/admin.js
const { DailyQuiz, Topic } = require('../models/Quiz');
const { Paper, Channel, App, Help } = require('../models/Content');
const User = require('../models/user');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');

// Helper to parse JSON body
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

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

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Daily Quiz Management
        if (path === '/api/admin/quiz/daily' && req.method === 'POST') {
            const body = await parseBody(req);
            await DailyQuiz.deleteMany({});
            const dailyQuiz = new DailyQuiz(body);
            await dailyQuiz.save();
            return res.status(201).json(dailyQuiz);
        }

        if (path.match(/^\/api\/admin\/quiz\/daily\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            const dailyQuiz = await DailyQuiz.findByIdAndUpdate(id, body, { new: true });
            return res.json(dailyQuiz);
        }

        if (path.match(/^\/api\/admin\/quiz\/daily\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await DailyQuiz.findByIdAndDelete(id);
            return res.json({ message: 'Daily quiz deleted' });
        }

        // Topics Management
        if (path === '/api/admin/quiz/topic' && req.method === 'POST') {
            const body = await parseBody(req);
            const topic = new Topic(body);
            await topic.save();
            return res.status(201).json(topic);
        }

        if (path.match(/^\/api\/admin\/quiz\/topic\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Topic.findByIdAndDelete(id);
            return res.json({ message: 'Topic deleted' });
        }

        // Questions Management
        if (path.match(/^\/api\/admin\/quiz\/topic\/[a-f0-9]{24}\/question$/) && req.method === 'POST') {
            const pathParts = path.split('/');
            const topicId = pathParts[pathParts.indexOf('topic') + 1];
            const body = await parseBody(req);
            
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            topic.questions.push(body);
            await topic.save();
            return res.status(201).json(topic);
        }

        if (path.match(/^\/api\/admin\/quiz\/topic\/[a-f0-9]{24}\/question\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const parts = path.split('/');
            const topicIndex = parts.indexOf('topic');
            const topicId = parts[topicIndex + 1];
            const questionId = parts[parts.length - 1];
            
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            topic.questions.pull(questionId);
            await topic.save();
            return res.json({ message: 'Question deleted' });
        }

        // Papers Management
        if (path === '/api/admin/papers' && req.method === 'POST') {
            const body = await parseBody(req);
            const paper = new Paper(body);
            await paper.save();
            return res.status(201).json(paper);
        }

        if (path.match(/^\/api\/admin\/papers\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            const paper = await Paper.findByIdAndUpdate(id, body, { new: true });
            return res.json(paper);
        }

        if (path.match(/^\/api\/admin\/papers\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Paper.findByIdAndDelete(id);
            return res.json({ message: 'Paper deleted' });
        }

        // Channels Management
        if (path === '/api/admin/channels' && req.method === 'POST') {
            const body = await parseBody(req);
            const channelData = {
                name: body.name,
                description: body.description,
                url: body.url,
                photoUrl: body.photoUrl || ''
            };
            const channel = new Channel(channelData);
            await channel.save();
            return res.status(201).json(channel);
        }

        if (path.match(/^\/api\/admin\/channels\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            const updateData = {
                name: body.name,
                description: body.description,
                url: body.url,
                photoUrl: body.photoUrl || ''
            };
            const channel = await Channel.findByIdAndUpdate(id, updateData, { new: true });
            return res.json(channel);
        }

        if (path.match(/^\/api\/admin\/channels\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await Channel.findByIdAndDelete(id);
            return res.json({ message: 'Channel deleted' });
        }

        // Apps Management
        if (path === '/api/admin/apps' && req.method === 'POST') {
            const body = await parseBody(req);
            const appData = {
                name: body.name,
                features: body.features,
                downloadUrl: body.downloadUrl,
                photoUrl: body.photoUrl || ''
            };
            const app = new App(appData);
            await app.save();
            return res.status(201).json(app);
        }

        if (path.match(/^\/api\/admin\/apps\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            const updateData = {
                name: body.name,
                features: body.features,
                downloadUrl: body.downloadUrl,
                photoUrl: body.photoUrl || ''
            };
            const app = await App.findByIdAndUpdate(id, updateData, { new: true });
            return res.json(app);
        }

        if (path.match(/^\/api\/admin\/apps\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
            const id = path.split('/').pop();
            await App.findByIdAndDelete(id);
            return res.json({ message: 'App deleted' });
        }

        // Help Management
        if (path === '/api/admin/help' && req.method === 'POST') {
            const body = await parseBody(req);
            await Help.deleteMany({});
            const help = new Help(body);
            await help.save();
            return res.status(201).json(help);
        }

        if (path.match(/^\/api\/admin\/help\/[a-f0-9]{24}$/) && req.method === 'PUT') {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            const help = await Help.findByIdAndUpdate(id, body, { new: true });
            return res.json(help);
        }

        if (path.match(/^\/api\/admin\/help\/[a-f0-9]{24}$/) && req.method === 'DELETE') {
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