let currentUser = null;
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTheme();
    setupEventListeners();
});

// Authentication Check
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    document.getElementById('userName').textContent = currentUser.fullname;
    document.getElementById('welcomeName').textContent = currentUser.fullname;
    
    if (currentUser.email === 'admin@zeta.com') {
        document.getElementById('adminBtn').style.display = 'block';
    }
    
    showWelcomePopup();
    loadData();
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.className = `${newTheme}-theme`;
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Welcome Popup
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    popup.style.display = 'block';
}

document.getElementById('continueBtn').addEventListener('click', () => {
    document.getElementById('welcomePopup').style.display = 'none';
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

// Setup Event Listeners
function setupEventListeners() {
    // Account Button
    document.getElementById('accountBtn').addEventListener('click', () => {
        document.getElementById('accountModal').style.display = 'block';
    });

    // Admin Button
    document.getElementById('adminBtn').addEventListener('click', () => {
        openAdminDashboard();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Update Password
    document.getElementById('updatePasswordBtn').addEventListener('click', () => {
        document.getElementById('accountModal').style.display = 'none';
        document.getElementById('updatePasswordModal').style.display = 'block';
    });

    // Help
    document.getElementById('helpBtn').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/help`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            if (response.ok && data.pdfUrl) {
                window.open(data.pdfUrl, '_blank');
            } else {
                showMessage('Help document not available', 'error');
            }
        } catch (error) {
            console.error('Error fetching help:', error);
            showMessage('Error loading help document', 'error');
        }
    });

    // Delete Account
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccount();
        }
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Update Password Form
    document.getElementById('updatePasswordForm').addEventListener('submit', updatePassword);

    // Show More Papers
    document.getElementById('showMorePapers').addEventListener('click', () => {
        document.getElementById('allPapersModal').style.display = 'block';
    });

    // Paper Search
    document.getElementById('paperSearch').addEventListener('input', (e) => {
        searchPapers(e.target.value);
    });
}

// Update Password
async function updatePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPasswordUpdate').value;
    const confirmPassword = document.getElementById('confirmPasswordUpdate').value;

    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Password updated successfully', 'success');
            document.getElementById('updatePasswordModal').style.display = 'none';
            document.getElementById('updatePasswordForm').reset();
        } else {
            showMessage(data.message || 'Password update failed', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showMessage('Error updating password', 'error');
    }
}

// Delete Account
async function deleteAccount() {
    try {
        const response = await fetch(`${API_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Account deleted successfully', 'success');
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }, 1500);
        } else {
            const data = await response.json();
            showMessage(data.message || 'Account deletion failed', 'error');
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        showMessage('Error deleting account', 'error');
    }
}

// Load All Data
async function loadData() {
    await loadDailyQuiz();
    await loadCompetitiveQuiz();
    await loadPapers();
    await loadChannels();
    await loadApps();
}

// Load Daily Quiz
async function loadDailyQuiz() {
    try {
        const response = await fetch(`${API_URL}/quiz/daily`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('dailyQuizContainer');
        
        if (response.ok && data) {
            const userAnswer = await getUserAnswer('daily', data._id);
            container.innerHTML = renderQuizQuestion(data, userAnswer, 'daily');
        } else {
            container.innerHTML = '<p class="empty-message">No daily quiz available</p>';
        }
    } catch (error) {
        console.error('Error loading daily quiz:', error);
    }
}

// Load Competitive Quiz
async function loadCompetitiveQuiz() {
    try {
        const response = await fetch(`${API_URL}/quiz/topics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('topicsContainer');
        
        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(topic => `
                <button class="topic-btn" onclick="loadTopicQuestions('${topic._id}', '${topic.name}')">
                    ${topic.name}
                </button>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No topics available</p>';
        }
    } catch (error) {
        console.error('Error loading topics:', error);
    }
}

// Load Topic Questions
async function loadTopicQuestions(topicId, topicName) {
    try {
        const response = await fetch(`${API_URL}/quiz/topic/${topicId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('questionsContainer');
        const topicsContainer = document.getElementById('topicsContainer');
        
        if (response.ok && data.questions.length > 0) {
            topicsContainer.style.display = 'none';
            container.style.display = 'block';
            
            let html = `<button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>`;
            html += `<h4 style="margin-bottom: 20px; color: var(--primary-color);">${topicName}</h4>`;
            
            for (const question of data.questions) {
                const userAnswer = await getUserAnswer('competitive', question._id);
                html += renderQuizQuestion(question, userAnswer, 'competitive');
            }
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading topic questions:', error);
    }
}

window.loadTopicQuestions = loadTopicQuestions;

function backToTopics() {
    document.getElementById('topicsContainer').style.display = 'grid';
    document.getElementById('questionsContainer').style.display = 'none';
}

window.backToTopics = backToTopics;

// Render Quiz Question
function renderQuizQuestion(question, userAnswer, type) {
    const answered = userAnswer !== null;
    const isCorrect = answered && userAnswer === question.correctOption;
    
    let html = '<div class="quiz-question">';
    html += `<p class="question-text">${question.question}</p>`;
    html += '<div class="options-container">';
    
    ['optionA', 'optionB', 'optionC', 'optionD'].forEach((opt, index) => {
        const optionLetter = String.fromCharCode(65 + index);
        const isUserAnswer = answered && userAnswer === optionLetter;
        const isCorrectOption = question.correctOption === optionLetter;
        
        let className = 'option-btn';
        if (answered) {
            if (isCorrectOption) className += ' correct';
            else if (isUserAnswer) className += ' wrong';
        }
        
        html += `<button class="${className}" 
                         onclick="answerQuestion('${question._id}', '${optionLetter}', '${type}')"
                         ${answered ? 'disabled' : ''}>
                    ${optionLetter}. ${question[opt]}
                 </button>`;
    });
    
    html += '</div>';
    
    if (answered) {
        html += `<div class="quiz-result ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? 'Your answer is correct! ✓' : 'Your answer is wrong ✗'}
                 </div>`;
    }
    
    html += '</div>';
    return html;
}

// Answer Question
async function answerQuestion(questionId, answer, type) {
    try {
        const response = await fetch(`${API_URL}/quiz/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ questionId, answer, type })
        });

        if (response.ok) {
            if (type === 'daily') {
                await loadDailyQuiz();
            } else if (type === 'competitive') {
                // Re-render the questions for the current topic
                const topicNameElem = document.querySelector('#questionsContainer h4');
                const topicName = topicNameElem ? topicNameElem.textContent : '';
                const topicId = document.querySelector('.back-to-topics')?.dataset.topicId;

                if (topicId && topicName) {
                    await loadTopicQuestions(topicId, topicName);
                } else {
                    // fallback: just reload topics list
                    backToTopics();
                }
            }
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

window.answerQuestion = answerQuestion;


// Get User Answer
async function getUserAnswer(type, questionId) {
    try {
        const response = await fetch(`${API_URL}/quiz/user-answer?type=${type}&questionId=${questionId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        return response.ok ? data.answer : null;
    } catch (error) {
        return null;
    }
}

// Load Papers
async function loadPapers() {
    try {
        const response = await fetch(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (response.ok && data.length > 0) {
            const recentPapers = data.slice(0, 3);
            document.getElementById('recentPapers').innerHTML = recentPapers.map(paper => `
                <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')">
                    <h3 class="paper-title">${paper.topicName}</h3>
                    <p class="paper-description">${paper.description}</p>
                </div>
            `).join('');

            if (data.length > 3) {
                document.getElementById('showMorePapers').style.display = 'block';
            }

            displayAllPapers(data);
        } else {
            document.getElementById('recentPapers').innerHTML = '<p class="empty-message">No research papers available</p>';
        }
    } catch (error) {
        console.error('Error loading papers:', error);
    }
}

function displayAllPapers(papers) {
    const container = document.getElementById('allPapersList');
    container.innerHTML = papers.map(paper => `
        <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')">
            <h3 class="paper-title">${paper.topicName}</h3>
            <p class="paper-description">${paper.description}</p>
        </div>
    `).join('');
}

function searchPapers(query) {
    fetch(`${API_URL}/papers/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.length > 0) {
            displayAllPapers(data);
        } else {
            document.getElementById('allPapersList').innerHTML = '<p class="empty-message">No papers found</p>';
        }
    })
    .catch(error => console.error('Error searching papers:', error));
}

function openPaper(url) {
    window.open(url, '_blank');
}

window.openPaper = openPaper;

// Load Channels
async function loadChannels() {
    try {
        const response = await fetch(`${API_URL}/channels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('channelsContainer');
        
        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(channel => `
                <div class="channel-card">
                    <h3 class="channel-name">${channel.name}</h3>
                    <p class="channel-description">${channel.description}</p>
                    <a href="${channel.url}" target="_blank" class="channel-link">Visit Channel</a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No YouTube channels available</p>';
        }
    } catch (error) {
        console.error('Error loading channels:', error);
    }
}

// Load Apps
async function loadApps() {
    try {
        const response = await fetch(`${API_URL}/apps`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('appsContainer');
        
        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(app => `
                <div class="app-card">
                    <h3 class="app-name">${app.name}</h3>
                    <p class="app-features">${app.features}</p>
                    <a href="${app.downloadUrl}" target="_blank" class="app-link">Download App</a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No apps available</p>';
        }
    } catch (error) {
        console.error('Error loading apps:', error);
    }
}

// Admin Dashboard (continued in admin.js for organization)
function openAdminDashboard() {
    document.getElementById('adminModal').style.display = 'block';
    loadAdminData();
    setupAdminListeners();
}