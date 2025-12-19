// Enhanced App.js - Professional Implementation

let authToken = null;
let currentUser = null;
let debounceTimer = null;

// Constants
const DEBOUNCE_DELAY = 300;
const MESSAGE_DURATION = 3000;
const API_TIMEOUT = 10000;

// Convert Google Drive view links to direct image URLs
function convertGoogleDriveUrl(url) {
    if (!url) return '';
    
    // Check if it's a Google Drive link
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url; // Return original URL if not a Drive link
}
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
    document.body.className = `${theme}-theme`;
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
// Enhanced Welcome Popup with accessibility
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'block';
        popup.removeAttribute('aria-hidden'); // Changed: remove instead of setting to false
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
                    // Remove focus from button BEFORE hiding
                    continueBtn.blur();
                    
                    // Use setTimeout to ensure blur happens first
                    setTimeout(() => {
                        popup.style.display = 'none';
                        popup.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                        
                        // Focus on main content
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            mainContent.setAttribute('tabindex', '-1');
                            mainContent.focus();
                            mainContent.removeAttribute('tabindex');
                        }
                    }, 0);
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

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.removeAttribute('aria-hidden'); // Changed: remove instead of setting to false
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
        // Remove focus from any active element inside modal
        const activeElement = document.activeElement;
        if (modal.contains(activeElement)) {
            activeElement.blur();
        }
        
        // Use setTimeout to ensure blur happens first
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }, 0);
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

// Enhanced Load Papers
async function loadPapers() {
    const container = document.getElementById('recentPapers');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            const recentPapers = data.slice(0, 3);
            container.innerHTML = recentPapers.map(paper => `
                <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')" role="button" tabindex="0">
                    <h3 class="paper-title">${escapeHtml(paper.topicName)}</h3>
                    <p class="paper-description">${escapeHtml(paper.description)}</p>
                    <span class="paper-link-indicator">📄 Open PDF →</span>
                </div>
            `).join('');
            
            if (data.length > 3) {
                document.getElementById('showMorePapers').style.display = 'block';
            }
            
            // Load all papers for modal
            displayAllPapers(data);
        } else {
            container.innerHTML = '<p class="empty-message">📚 No research papers available yet</p>';
        }
    } catch (error) {
        console.error('Error loading papers:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load papers</p>';
    }
}

// Get User Answer
async function getUserAnswer(type, questionId) {
    try {
        const response = await fetchWithTimeout(
            `${API_URL}/quiz/user-answer?type=${type}&questionId=${questionId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.answer;
        }
        return null;
    } catch (error) {
        return null;
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
            
            // Add event delegation for daily quiz option buttons
            setupQuizEventDelegation(container);
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

// Store current topic for reloading
let currentTopicId = null;
let currentTopicName = null;

// Load Topic Questions
async function loadTopicQuestions(topicId, topicName) {
    const container = document.getElementById('questionsContainer');
    const topicsContainer = document.getElementById('topicsContainer');
    
    if (!container || !topicsContainer) return;
    
    currentTopicId = topicId;
    currentTopicName = topicName;
    
    container.innerHTML = '<div class="skeleton" style="height: 300px; border-radius: 12px;"></div>';
    topicsContainer.style.display = 'none';
    container.style.display = 'block';
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/topic/${topicId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.questions && data.questions.length > 0) {
            // Fetch all user answers in ONE request
            const questionIds = data.questions.map(q => q._id);
            const answersResponse = await fetchWithTimeout(`${API_URL}/quiz/user-answers-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    questionIds,
                    type: 'competitive'
                })
            });
            
            const { answers } = await answersResponse.json();
            
            // Count attempted questions
            const attemptedCount = Object.keys(answers).length;
            
            let html = `<button class="back-to-topics" onclick="backToTopics()" aria-label="Back to topics">← Back to Topics</button>`;
            html += `<h4 style="margin-bottom: 20px; color: var(--primary-600); font-size: 1.5rem;">${escapeHtml(topicName)}</h4>`;
            html += `<div style="margin-bottom: 20px; padding: 12px; background: var(--primary-50); border-radius: 8px; text-align: center; font-weight: 600; color: var(--primary-600);">
                        Questions Attempted: ${attemptedCount}/${data.questions.length}
                     </div>`;
            
            let questionNumber = 1;
            for (const question of data.questions) {
                const userAnswer = answers[question._id] || null;
                html += renderQuizQuestion(question, userAnswer, 'competitive', questionNumber);
                questionNumber++;
            }
            
            container.innerHTML = html;
            setupQuizEventDelegation(container);
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
    
    // Clear current topic info
    currentTopicId = null;
    currentTopicName = null;
    
    if (topicsContainer) topicsContainer.style.display = 'grid';
    if (questionsContainer) questionsContainer.style.display = 'none';
}

window.backToTopics = backToTopics;

// Enhanced Quiz Question Renderer
function renderQuizQuestion(question, userAnswer, type, questionNumber = null) {
    const answered = userAnswer !== null;
    const isCorrect = answered && userAnswer === question.correctOption;
    const startTime = Date.now(); // Add timer start
    
    let html = '<div class="quiz-question">';
    if (questionNumber) {
        html += `<div style="font-weight: 700; color: var(--primary-600); margin-bottom: 8px; font-size: 0.875rem;">Question ${questionNumber}</div>`;
    }
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
        
        // Use data attributes and event delegation instead of onclick
        html += `<button class="${className}" 
                         data-question-id="${question._id}"
                         data-answer="${optionLetter}"
                         data-type="${type}"
                         data-start-time="${startTime}"
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

// Setup Event Delegation for Quiz Buttons
function setupQuizEventDelegation(container) {
    // Remove any existing listeners to prevent duplicates
    const oldContainer = container.cloneNode(true);
    container.parentNode.replaceChild(oldContainer, container);
    
    // Add event listener to the container
    oldContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.option-btn');
        
        // Check if clicked element is an option button and not disabled
        if (button && !button.disabled) {
            e.preventDefault();
            e.stopPropagation();
            
            const questionId = button.getAttribute('data-question-id');
            const answer = button.getAttribute('data-answer');
            const type = button.getAttribute('data-type');
            const startTime = parseInt(button.getAttribute('data-start-time'));

            if (questionId && answer && type) {
                await answerQuestion(questionId, answer, type, startTime);
            }
        }
    });
}

// Enhanced Answer Question - No Page Refresh
async function answerQuestion(questionId, answer, type, startTime) {
    try {
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        
        showMessage('Submitting answer...', 'info');
        
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Session expired. Please login again.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        
        const response = await fetch(`${API_URL}/quiz/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questionId,
                answer,
                type,
                timeTaken
            })
        });

        if (response.status === 401) {
            showMessage('Session expired. Please login again.', 'error');
            localStorage.clear();
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        const data = await response.json();

        if (response.ok) {
            showMessage('Answer submitted successfully!', 'success');
            
            // Reload appropriate section
            if (type === 'daily') {
                await loadDailyQuiz();
            } else if (type === 'competitive') {
                if (currentTopicId && currentTopicName) {
                    await loadTopicQuestions(currentTopicId, currentTopicName);
                }
            }
        } else {
            showMessage(data.message || 'Failed to submit answer', 'error');
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        showMessage('Network error. Please try again.', 'error');
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
        
        if (data.length > 0) {
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
            container.innerHTML = data.map(channel => {
                const imageUrl = convertGoogleDriveUrl(channel.photoUrl); // Convert URL
                return `
                    <div class="channel-card">
                        ${imageUrl && imageUrl.trim() !== '' 
                            ? `<img src="${imageUrl}" alt="${escapeHtml(channel.name)}" class="card-image" crossorigin="anonymous">` 
                            : `<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📺</div>`
                        }
                        <div class="card-content">
                            <h3 class="channel-name">${escapeHtml(channel.name)}</h3>
                            <p class="channel-description">${escapeHtml(channel.description)}</p>
                            <a href="${channel.url}" target="_blank" rel="noopener noreferrer" class="channel-link">
                                Visit Channel →
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add error handlers after DOM is created
            container.querySelectorAll('.card-image[src]').forEach(img => {
                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    this.outerHTML = '<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📺</div>';
                });
            });
        } else {
            container.innerHTML = '<p class="empty-message">📺 No YouTube channels available</p>';
        }
    } catch (error) {
        console.error('Error loading channels:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load channels</p>';
    }
}

// Enhanced Load Apps
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
            container.innerHTML = data.map(app => {
                const imageUrl = convertGoogleDriveUrl(app.photoUrl); // Convert URL
                return `
                    <div class="app-card">
                        ${imageUrl && imageUrl.trim() !== '' 
                            ? `<img src="${app.photoUrl}" alt="${escapeHtml(app.name)}" class="card-image" crossorigin="anonymous">` 
                            : `<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📱</div>`
                        }
                        <div class="card-content">
                            <h3 class="app-name">${escapeHtml(app.name)}</h3>
                            <p class="app-features">${escapeHtml(app.features)}</p>
                            <a href="${app.downloadUrl}" target="_blank" rel="noopener noreferrer" class="app-link">
                                Download App →
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add error handlers after DOM is created
            container.querySelectorAll('.card-image[src]').forEach(img => {
                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    this.outerHTML = '<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📱</div>';
                });
            });
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

console.log('✨ Zeta App System Initialized');