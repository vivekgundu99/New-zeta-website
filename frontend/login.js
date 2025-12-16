// Enhanced Login.js - Professional Authentication
const API_URL = 'https://zeta-backend1.vercel.app/api';

// Constants
const MIN_PASSWORD_LENGTH = 6;
const API_TIMEOUT = 10000;

// Utility: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection.');
        }
        throw error;
    }
}

// Enhanced Theme Management
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.className = `${savedTheme}-theme`;
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
        icon.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.className = `${newTheme}-theme`;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

loadTheme();

// Enhanced Message System
function showMessage(message, type = 'success') {
    const popup = document.getElementById('messagePopup');
    if (!popup) return;
    
    // Clear existing timeout
    if (popup.timeoutId) {
        clearTimeout(popup.timeoutId);
    }
    
    popup.textContent = message;
    popup.className = `message-popup ${type} show`;
    popup.setAttribute('role', 'alert');
    popup.setAttribute('aria-live', 'polite');
    
    popup.timeoutId = setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
    
    // Click to dismiss
    popup.onclick = () => {
        popup.classList.remove('show');
        clearTimeout(popup.timeoutId);
    };
}

// Form Navigation
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Navigation handlers
document.getElementById('showSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm(loginForm, signupForm);
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm(signupForm, loginForm);
});

document.getElementById('showForgotPassword')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm(loginForm, forgotPasswordForm);
});

document.getElementById('backToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchForm(forgotPasswordForm, loginForm);
});

// Smooth form switching
function switchForm(from, to) {
    if (from) {
        from.classList.remove('active');
    }
    if (to) {
        setTimeout(() => {
            to.classList.add('active');
            // Focus first input
            const firstInput = to.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Input validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= MIN_PASSWORD_LENGTH;
}

function sanitizeInput(input) {
    return input.trim();
}

// Show input error
function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorSpan = document.createElement('span');
    errorSpan.className = 'form-error';
    errorSpan.textContent = message;
    input.parentElement.appendChild(errorSpan);
    
    // Remove error on input
    input.addEventListener('input', () => {
        input.classList.remove('error');
        errorSpan.remove();
    }, { once: true });
}

// Clear all input errors
function clearInputErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => el.remove());
}

// Enhanced Login Form Handler
const loginFormElement = document.getElementById('loginFormElement');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInputErrors();
        
        const email = sanitizeInput(document.getElementById('loginEmail').value);
        const password = document.getElementById('loginPassword').value;

        // Client-side validation
        if (!validateEmail(email)) {
            showInputError('loginEmail', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            showInputError('loginPassword', 'Please enter your password');
            return;
        }

        // Show loading state
        const submitBtn = loginFormElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                
                // Smooth redirect
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(data.message || 'Invalid email or password', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(error.message || 'Unable to connect. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Enhanced Signup Form Handler
const signupFormElement = document.getElementById('signupFormElement');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInputErrors();
        
        const fullname = sanitizeInput(document.getElementById('signupFullname').value);
        const email = sanitizeInput(document.getElementById('signupEmail').value);
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = sanitizeInput(document.getElementById('securityAnswer').value);

        // Client-side validation
        if (!fullname || fullname.length < 2) {
            showInputError('signupFullname', 'Please enter your full name');
            return;
        }

        if (!validateEmail(email)) {
            showInputError('signupEmail', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showInputError('signupPassword', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        if (password !== confirmPassword) {
            showInputError('signupConfirmPassword', 'Passwords do not match');
            showMessage('Passwords do not match', 'error');
            return;
        }

        if (!securityQuestion) {
            showInputError('securityQuestion', 'Please select a security question');
            return;
        }

        if (!securityAnswer || securityAnswer.length < 2) {
            showInputError('securityAnswer', 'Please provide a security answer');
            return;
        }

        // Show loading state
        const submitBtn = signupFormElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            const response = await fetchWithTimeout(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname,
                    email,
                    password,
                    securityQuestion,
                    securityAnswer
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Account created successfully! Please login.', 'success');
                setTimeout(() => {
                    switchForm(signupForm, loginForm);
                    signupFormElement.reset();
                }, 1500);
            } else {
                showMessage(data.message || 'Signup failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage(error.message || 'Unable to connect. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Enhanced Forgot Password - Fetch Security Question
const forgotEmailInput = document.getElementById('forgotEmail');
if (forgotEmailInput) {
    forgotEmailInput.addEventListener('blur', async (e) => {
        const email = sanitizeInput(e.target.value);
        if (!validateEmail(email)) return;

        const questionSelect = document.getElementById('forgotSecurityQuestion');
        if (!questionSelect) return;

        // Show loading state
        questionSelect.disabled = true;
        questionSelect.innerHTML = '<option value="">Loading...</option>';

        try {
            const response = await fetchWithTimeout(
                `${API_URL}/auth/security-question?email=${encodeURIComponent(email)}`
            );
            const data = await response.json();

            if (response.ok) {
                questionSelect.disabled = false;
                const questionText = getQuestionText(data.securityQuestion);
                questionSelect.innerHTML = `<option value="${data.securityQuestion}">${questionText}</option>`;
            } else {
                questionSelect.disabled = true;
                questionSelect.innerHTML = '<option value="">User not found</option>';
                showMessage(data.message || 'Email not found', 'error');
            }
        } catch (error) {
            console.error('Error fetching security question:', error);
            questionSelect.disabled = true;
            questionSelect.innerHTML = '<option value="">Error loading question</option>';
            showMessage('Unable to verify email', 'error');
        }
    });
}

// Get question text from value
function getQuestionText(value) {
    const questions = {
        'pet': "What is your pet's name?",
        'city': 'In which city were you born?',
        'school': 'What is your school name?',
        'book': 'What is your favorite book?'
    };
    return questions[value] || value;
}

// Enhanced Forgot Password Form Handler
const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
if (forgotPasswordFormElement) {
    forgotPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInputErrors();
        
        const email = sanitizeInput(document.getElementById('forgotEmail').value);
        const securityQuestion = document.getElementById('forgotSecurityQuestion').value;
        const securityAnswer = sanitizeInput(document.getElementById('forgotSecurityAnswer').value);
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Client-side validation
        if (!validateEmail(email)) {
            showInputError('forgotEmail', 'Please enter a valid email address');
            return;
        }

        if (!securityQuestion) {
            showInputError('forgotSecurityQuestion', 'Please wait for security question to load');
            return;
        }

        if (!securityAnswer) {
            showInputError('forgotSecurityAnswer', 'Please answer the security question');
            return;
        }

        if (!validatePassword(newPassword)) {
            showInputError('newPassword', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showInputError('confirmNewPassword', 'Passwords do not match');
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        const submitBtn = forgotPasswordFormElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Resetting password...';

        try {
            const response = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    securityQuestion,
                    securityAnswer,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Password reset successfully! You can now login.', 'success');
                setTimeout(() => {
                    switchForm(forgotPasswordForm, loginForm);
                    forgotPasswordFormElement.reset();
                    
                    // Reset security question dropdown
                    const questionSelect = document.getElementById('forgotSecurityQuestion');
                    if (questionSelect) {
                        questionSelect.disabled = true;
                        questionSelect.innerHTML = '<option value="">First enter your email</option>';
                    }
                }, 1500);
            } else {
                showMessage(data.message || 'Password reset failed. Please check your answers.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showMessage(error.message || 'Unable to connect. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Real-time password strength indicator
function addPasswordStrengthIndicator() {
    const passwordInputs = [
        document.getElementById('signupPassword'),
        document.getElementById('newPassword')
    ];

    passwordInputs.forEach(input => {
        if (!input) return;

        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <span class="strength-text"></span>
        `;
        input.parentElement.appendChild(indicator);

        input.addEventListener('input', (e) => {
            const password = e.target.value;
            const fill = indicator.querySelector('.strength-fill');
            const text = indicator.querySelector('.strength-text');

            if (!password) {
                fill.style.width = '0%';
                text.textContent = '';
                return;
            }

            let strength = 0;
            let message = '';
            let color = '';

            // Calculate strength
            if (password.length >= 6) strength += 25;
            if (password.length >= 10) strength += 25;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
            if (/[0-9]/.test(password)) strength += 12.5;
            if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

            if (strength < 40) {
                message = 'Weak';
                color = '#ef4444';
            } else if (strength < 70) {
                message = 'Fair';
                color = '#f59e0b';
            } else {
                message = 'Strong';
                color = '#10b981';
            }

            fill.style.width = `${strength}%`;
            fill.style.backgroundColor = color;
            text.textContent = message;
            text.style.color = color;
        });
    });
}

// Initialize password strength indicators
addPasswordStrengthIndicator();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
        const activeForm = document.querySelector('.form-section.active');
        if (activeForm && activeForm.id !== 'loginForm') {
            switchForm(activeForm, loginForm);
        }
    }
});

// Check if already logged in
if (localStorage.getItem('token') && localStorage.getItem('user')) {
    window.location.href = 'index.html';
}

console.log('✨ Zeta Login System Initialized');