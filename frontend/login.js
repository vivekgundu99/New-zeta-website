const API_URL = 'https://zeta-website.onrender.com';

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.className = `${savedTheme}-theme`;
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.className = `${newTheme}-theme`;
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

loadTheme();

// Form Navigation
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

document.getElementById('showForgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    forgotPasswordForm.classList.add('active');
});

document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Message Popup
function showMessage(message, type = 'success') {
    const popup = document.getElementById('messagePopup');
    popup.textContent = message;
    popup.className = `message-popup ${type} show`;
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

// Login Form Handler
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
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
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error connecting to server', 'error');
    }
});

// Signup Form Handler
document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('signupFullname').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const securityQuestion = document.getElementById('securityQuestion').value;
    const securityAnswer = document.getElementById('securityAnswer').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (!securityQuestion) {
        showMessage('Please select a security question', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
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
                signupForm.classList.remove('active');
                loginForm.classList.add('active');
                document.getElementById('signupFormElement').reset();
            }, 1500);
        } else {
            showMessage(data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Error connecting to server', 'error');
    }
});

// Forgot Password - Fetch Security Question
document.getElementById('forgotEmail').addEventListener('blur', async (e) => {
    const email = e.target.value;
    if (!email) return;

    try {
        const response = await fetch(`${API_URL}/auth/security-question?email=${email}`);
        const data = await response.json();

        const questionSelect = document.getElementById('forgotSecurityQuestion');
        
        if (response.ok) {
            questionSelect.disabled = false;
            questionSelect.innerHTML = `<option value="${data.securityQuestion}">${getQuestionText(data.securityQuestion)}</option>`;
        } else {
            questionSelect.disabled = true;
            questionSelect.innerHTML = '<option value="">User not found</option>';
            showMessage(data.message || 'User not found', 'error');
        }
    } catch (error) {
        console.error('Error fetching security question:', error);
        showMessage('Error connecting to server', 'error');
    }
});

function getQuestionText(value) {
    const questions = {
        'pet': 'What is your pet\'s name?',
        'city': 'In which city were you born?',
        'school': 'What is your school name?',
        'book': 'What is your favorite book?'
    };
    return questions[value] || value;
}

// Forgot Password Form Handler
document.getElementById('forgotPasswordFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const securityQuestion = document.getElementById('forgotSecurityQuestion').value;
    const securityAnswer = document.getElementById('forgotSecurityAnswer').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
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
            showMessage('Password reset successfully!', 'success');
            setTimeout(() => {
                forgotPasswordForm.classList.remove('active');
                loginForm.classList.add('active');
                document.getElementById('forgotPasswordFormElement').reset();
                document.getElementById('forgotSecurityQuestion').disabled = true;
                document.getElementById('forgotSecurityQuestion').innerHTML = '<option value="">First enter your email</option>';
            }, 1500);
        } else {
            showMessage(data.message || 'Password reset failed', 'error');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showMessage('Error connecting to server', 'error');
    }
});