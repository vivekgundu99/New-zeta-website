// backend/api/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { 
  signupSchema, 
  loginSchema, 
  updatePasswordSchema, 
  resetPasswordSchema 
} = require('../validators/auth');
const { authLimiter } = require('../middleware/security');
const connectDB = require('../lib/db');
const setCorsHeaders = require('../lib/cors'); // ADD THIS


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

module.exports = async (req, res) => {
    // Enable CORS
    if (setCorsHeaders(req, res)) return;

    await connectDB();

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Signup
        if (path === '/api/auth/signup' && req.method === 'POST') {
            const body = await parseBody(req);
            
            // Validate input
            const { error, value } = signupSchema.validate(body);
            if (error) {
                return res.status(400).json({ 
                    message: error.details[0].message 
                });
            }
            
            const { fullname, email, password, securityQuestion, securityAnswer } = value;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const user = new User({
                fullname,
                email,
                password,
                securityQuestion,
                securityAnswer
            });

            await user.save();
            return res.status(201).json({ message: 'User created successfully' });
        }

        // Login
        if (path === '/api/auth/login' && req.method === 'POST') {
            const body = await parseBody(req);
            
            // Validate input
            const { error, value } = loginSchema.validate(body);
            if (error) {
                return res.status(400).json({ 
                    message: error.details[0].message 
                });
            }
            
            const { email, password } = value;

            const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
            
            // Check if account is locked
            if (user && user.lockUntil && user.lockUntil > Date.now()) {
                const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
                return res.status(403).json({ 
                    message: `Account is locked. Try again in ${lockMinutes} minutes.` 
                });
            }
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                // Increment login attempts
                if (user) {
                    await user.incrementLoginAttempts();
                }
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            // Reset login attempts on successful login
            if (user.loginAttempts > 0 || user.lockUntil) {
                await user.resetLoginAttempts();
            }
            
            // Update last login
            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                token,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email
                }
            });
        }

        // Get security question
        if (path === '/api/auth/security-question' && req.method === 'GET') {
            const email = url.searchParams.get('email');
            
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json({ securityQuestion: user.securityQuestion });
        }

        // Reset password
        if (path === '/api/auth/reset-password' && req.method === 'POST') {
            const body = await parseBody(req);
            const { email, securityQuestion, securityAnswer, newPassword } = body;

            const user = await User.findOne({ email, securityQuestion });
            if (!user) {
                return res.status(404).json({ message: 'User not found or incorrect security question' });
            }

            const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);
            if (!isAnswerValid) {
                return res.status(401).json({ message: 'Incorrect security answer' });
            }

            user.password = newPassword;
            await user.save();

            return res.json({ message: 'Password reset successfully' });
        }

        // Update password (authenticated)
        if (path === '/api/auth/update-password' && req.method === 'POST') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ message: 'No authentication token' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            const body = await parseBody(req);
            const { currentPassword, newPassword } = body;

            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            user.password = newPassword;
            await user.save();

            return res.json({ message: 'Password updated successfully' });
        }

        // Delete account (authenticated)
        if (path === '/api/auth/delete-account' && req.method === 'DELETE') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ message: 'No authentication token' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            await User.findByIdAndDelete(decoded.userId);

            return res.json({ message: 'Account deleted successfully' });
        }

        res.status(404).json({ message: 'Route not found' });
    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};