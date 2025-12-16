// Enhanced App.js - Professional Implementation
let authToken = null;
let currentUser = null;
let debounceTimer = null;

// Constants
const DEBOUNCE_DELAY = 300;
const MESSAGE_DURATION = 3000;
const API_TIMEOUT = 20000;

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        checkAuth();
        loadTheme();
        setupEventListeners();
        setupKeyboardNavigation();
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Application initialization failed. Please refresh.', 'error');
    }
});

// Enhanced Authentication Check
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        updateUserInterface();
        showWelcomePopup();
        loadDataWithProgress();
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Update user interface with user data
function updateUserInterface() {
    const userNameEl = document.getElementById('userName');
    const welcomeNameEl = document.getElementById('welcomeName');
    
    if (userNameEl) userNameEl.textContent = currentUser.fullname;
    if (welcomeNameEl) welcomeNameEl.textContent = currentUser.fullname;
    
    if (currentUser.email === 'admin@zeta.com') {
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) adminBtn.style.display = 'block';
    }
}

// Enhanced Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    updateThemeIcon(theme);
    localStorage.setItem('theme', theme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
        icon.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
}

// Theme toggle with smooth transition
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        
        // Add ripple effect
        createRipple(themeToggle, event);
    });
}

// Ripple effect utility
function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Enhanced Welcome Popup with accessibility
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'block';
        popup.removeAttribute('inert');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

// Enhanced Message System with auto-dismiss
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
    
    // Auto-dismiss
    popup.timeoutId = setTimeout(() => {
        popup.classList.remove('show');
    }, MESSAGE_DURATION);
    
    // Click to dismiss
    popup.onclick = () => {
        popup.classList.remove('show');
        clearTimeout(popup.timeoutId);
    };
}

// Enhanced Event Listeners Setup
function setupEventListeners() {
    // Continue Button
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const popup = document.getElementById('welcomePopup');
            if (popup) {
                popup.style.display = 'none';
                document.body.style.overflow = '';
                document.body.removeAttribute('style');

            }
        });
    }

    // Account Button
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', () => openModal('accountModal'));
    }

    // Admin Button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminDashboard);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Update Password
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', () => {
            closeModal('accountModal');
            openModal('updatePasswordModal');
        });
    }

    // Help
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', handleHelp);
    }

    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Update Password Form
    const updatePasswordForm = document.getElementById('updatePasswordForm');
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', updatePassword);
    }

    // Show More Papers
    const showMorePapers = document.getElementById('showMorePapers');
    if (showMorePapers) {
        showMorePapers.addEventListener('click', () => openModal('allPapersModal'));
    }

    // Paper Search with debounce
    const paperSearch = document.getElementById('paperSearch');
    if (paperSearch) {
        paperSearch.addEventListener('input', (e) => {
            debounceSearch(e.target.value);
        });
    }
}

// Debounced search
function debounceSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchPapers(query);
    }, DEBOUNCE_DELAY);
}

// Keyboard Navigation Setup
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            openModals.forEach(modal => closeModal(modal.id));
        }
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.onclick) {
        document.activeElement.click();
    }
});

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            setTimeout(() => focusable.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Enhanced Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Show loading state
        showMessage('Logging out...', 'info');
        
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }, 500);
    }
}

// Enhanced Update Password with validation
async function updatePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPasswordUpdate').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordUpdate').value.trim();
    
    // Client-side validation
    if (!validatePassword(newPassword, confirmPassword)) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        const response = await fetchWithTimeout(`${API_URL}/auth/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Password updated successfully!', 'success');
            closeModal('updatePasswordModal');
            document.getElementById('updatePasswordForm').reset();
        } else {
            showMessage(data.message || 'Password update failed', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showMessage(error.message || 'Error updating password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Password validation
function validatePassword(newPassword, confirmPassword) {
    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

// Enhanced Delete Account
async function handleDeleteAccount() {
    const confirmed = confirm('⚠️ WARNING: This action cannot be undone!\n\nAre you absolutely sure you want to delete your account? All your data will be permanently removed.');
    
    if (!confirmed) return;
    
    const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleCheck !== 'DELETE') {
        showMessage('Account deletion cancelled', 'info');
        return;
    }

    try {
        showMessage('Deleting account...', 'info');
        
        const response = await fetchWithTimeout(`${API_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Account deleted successfully', 'success');
            setTimeout(() => {
                localStorage.clear();
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

// Enhanced Help Handler
async function handleHelp() {
    try {
        showMessage('Loading help document...', 'info');
        
        const response = await fetchWithTimeout(`${API_URL}/help`, {
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
}

// Load Data with Progress Indicator
async function loadDataWithProgress() {
    const sections = [
        { fn: loadDailyQuiz, name: 'Daily Quiz' },
        { fn: loadCompetitiveQuiz, name: 'Topics' },
        { fn: loadPapers, name: 'Papers' },
        { fn: loadChannels, name: 'Channels' },
        { fn: loadApps, name: 'Apps' }
    ];
    
    for (const section of sections) {
        try {
            await section.fn();
        } catch (error) {
            console.error(`Error loading ${section.name}:`, error);
            showMessage(`Failed to load ${section.name}`, 'error');
        }
    }
}

// Enhanced Fetch with Timeout
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

// Enhanced Load Daily Quiz with error handling
async function loadDailyQuiz() {
    const container = document.getElementById('dailyQuizContainer');
    if (!container) return;
    
    // Show loading skeleton
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>';
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/daily`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data) {
            const userAnswer = await getUserAnswer('daily', data._id);
            container.innerHTML = renderQuizQuestion(data, userAnswer, 'daily');
        } else {
            container.innerHTML = '<p class="empty-message">📝 No daily quiz available today</p>';
        }
    } catch (error) {
        console.error('Error loading daily quiz:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load daily quiz</p>';
    }
}

// Enhanced Load Competitive Quiz
async function loadCompetitiveQuiz() {
    const container = document.getElementById('topicsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 150px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/topics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(topic => `
                <button class="topic-btn" onclick="loadTopicQuestions('${topic._id}', '${escapeHtml(topic.name)}')" aria-label="Load ${escapeHtml(topic.name)} quiz">
                    ${escapeHtml(topic.name)}
                </button>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">📚 No topics available yet</p>';
        }
    } catch (error) {
        console.error('Error loading topics:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load topics</p>';
    }
}

// Load Topic Questions
async function loadTopicQuestions(topicId, topicName) {
    const container = document.getElementById('questionsContainer');
    const topicsContainer = document.getElementById('topicsContainer');
    
    if (!container || !topicsContainer) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 300px; border-radius: 12px;"></div>';
    topicsContainer.style.display = 'none';
    container.style.display = 'block';
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/topic/${topicId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.questions && data.questions.length > 0) {
            let html = `<button class="back-to-topics" onclick="backToTopics()" aria-label="Back to topics">← Back to Topics</button>`;
            html += `<h4 style="margin-bottom: 20px; color: var(--primary-600); font-size: 1.5rem;">${escapeHtml(topicName)}</h4>`;
            
            for (const question of data.questions) {
                const userAnswer = await getUserAnswer('competitive', question._id);
                html += renderQuizQuestion(question, userAnswer, 'competitive');
            }
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>
                <p class="empty-message">No questions available in this topic</p>
            `;
        }
    } catch (error) {
        console.error('Error loading topic questions:', error);
        container.innerHTML = `
            <button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>
            <p class="empty-message error">⚠️ Failed to load questions</p>
        `;
    }
}

// Make functions globally accessible
window.loadTopicQuestions = loadTopicQuestions;

function backToTopics() {
    const topicsContainer = document.getElementById('topicsContainer');
    const questionsContainer = document.getElementById('questionsContainer');
    
    if (topicsContainer) topicsContainer.style.display = 'grid';
    if (questionsContainer) questionsContainer.style.display = 'none';
}

window.backToTopics = backToTopics;

// Enhanced Quiz Question Renderer
function renderQuizQuestion(question, userAnswer, type) {
    const answered = userAnswer !== null;
    const isCorrect = answered && userAnswer === question.correctOption;

    let html = `<div class="quiz-question" id="question-${question._id}">`; // Add unique ID
    html += `<p class="question-text">${escapeHtml(question.question)}</p>`;
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
                    ${answered ? 'disabled' : ''}
                    aria-label="Option ${optionLetter}">
                ${optionLetter}. ${escapeHtml(question[opt])}
            </button>`;
    });

    html += '</div>';

    if (answered) {
        const icon = isCorrect ? '✓' : '✗';
        const text = isCorrect ? 'Correct!' : 'Incorrect';
        html += `<div class="quiz-result ${isCorrect ? 'correct' : 'wrong'}" role="alert">
                    ${icon} ${text}
                </div>`;
    }

    html += '</div>';
    return html;
}


// Enhanced Answer Question
async function answerQuestion(questionId, answer, type) {
    try {
        showMessage('Submitting answer...', 'info');

        const response = await fetchWithTimeout(`${API_URL}/quiz/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ questionId, answer, type })
        });

        if (response.ok) {
            if (type === 'daily') {
                await loadDailyQuiz(); // reload daily quiz
            } else {
                // Reload only the specific question for competitive quiz
                const questionDiv = document.getElementById(`question-${questionId}`);
                if (questionDiv) {
                    const questionDataResponse = await fetchWithTimeout(`${API_URL}/quiz/question/${questionId}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const questionData = await questionDataResponse.json();
                    const userAnswer = await getUserAnswer('competitive', questionId);
                    questionDiv.innerHTML = renderQuizQuestion(questionData, userAnswer, 'competitive');
                }
            }
        } else {
            const data = await response.json();
            showMessage(data.message || 'Failed to submit answer', 'error');
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        showMessage('Error submitting answer', 'error');
    }
}

window.answerQuestion = answerQuestion;


// Get User Answer
async function getUserAnswer(type, questionId) {
    try {
        const response = await fetchWithTimeout(
            `${API_URL}/quiz/user-answer?type=${type}&questionId=${questionId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` }}
        );
        
        const data = await response.json();
        return response.ok ? data.answer : null;
    } catch (error) {
        console.error('Error getting user answer:', error);
        return null;
    }
}

// Enhanced Load Papers
async function loadPapers() {
    const recentContainer = document.getElementById('recentPapers');
    if (!recentContainer) return;
    
    recentContainer.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            const recentPapers = data.slice(0, 3);
            recentContainer.innerHTML = recentPapers.map(paper => `
                <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')" role="button" tabindex="0" aria-label="Open ${escapeHtml(paper.topicName)}">
                    <h3 class="paper-title">${escapeHtml(paper.topicName)}</h3>
                    <p class="paper-description">${escapeHtml(paper.description)}</p>
                    <span class="paper-link-indicator">📄 Open PDF →</span>
                </div>
            `).join('');

            const showMoreBtn = document.getElementById('showMorePapers');
            if (showMoreBtn) {
                showMoreBtn.style.display = data.length > 3 ? 'inline-block' : 'none';
            }

            displayAllPapers(data);
        } else {
            recentContainer.innerHTML = '<p class="empty-message">📚 No research papers available</p>';
        }
    } catch (error) {
        console.error('Error loading papers:', error);
        recentContainer.innerHTML = '<p class="empty-message error">⚠️ Failed to load papers</p>';
    }
}

// Display All Papers
function displayAllPapers(papers) {
    const container = document.getElementById('allPapersList');
    if (!container) return;
    
    container.innerHTML = papers.map(paper => `
        <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')" role="button" tabindex="0">
            <h3 class="paper-title">${escapeHtml(paper.topicName)}</h3>
            <p class="paper-description">${escapeHtml(paper.description)}</p>
            <span class="paper-link-indicator">📄 Open PDF →</span>
        </div>
    `).join('');
}

// Enhanced Search Papers with debouncing
async function searchPapers(query) {
    const container = document.getElementById('allPapersList');
    if (!container) return;
    
    if (!query.trim()) {
        // Reload all papers if search is empty
        const response = await fetchWithTimeout(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        displayAllPapers(data);
        return;
    }
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(
            `${API_URL}/papers/search?q=${encodeURIComponent(query)}`,
            { headers: { 'Authorization': `Bearer ${authToken}` }}
        );
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {

            displayAllPapers(data);
        } else {
            container.innerHTML = '<p class="empty-message">🔍 No papers found matching your search</p>';
        }
    } catch (error) {
        console.error('Error searching papers:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Search failed</p>';
    }
}

// Open Paper
function openPaper(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

window.openPaper = openPaper;

// Enhanced Load Channels
async function loadChannels() {
    const container = document.getElementById('channelsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/channels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(channel => `
                <div class="channel-card">
                    <h3 class="channel-name">📺 ${escapeHtml(channel.name)}</h3>
                    <p class="channel-description">${escapeHtml(channel.description)}</p>
                    <a href="${channel.url}" target="_blank" rel="noopener noreferrer" class="channel-link">
                        Visit Channel →
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">📺 No YouTube channels available</p>';
        }
    } catch (error) {
        console.error('Error loading channels:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load channels</p>';
    }
}

// Enhanced Load Apps
async function loadApps() {
    const container = document.getElementById('appsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/apps`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(app => `
                <div class="app-card">
                    <h3 class="app-name">📱 ${escapeHtml(app.name)}</h3>
                    <p class="app-features">${escapeHtml(app.features)}</p>
                    <a href="${app.downloadUrl}" target="_blank" rel="noopener noreferrer" class="app-link">
                        Download App →
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">📱 No apps available</p>';
        }
    } catch (error) {
        console.error('Error loading apps:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load apps</p>';
    }
}

// XSS Protection - Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Admin Dashboard

function openAdminDashboard() {
    openModal('adminModal');

    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }

    if (typeof setupAdminListeners === 'function') {
        setupAdminListeners();
    }
}
async function fetchWithRetry(url, options = {}, retries = 2) {
    try {
        return await fetchWithRetry(url, options);
    } catch (err) {
        if (retries > 0) {
            return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
}