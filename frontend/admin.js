// Admin Dashboard Functions
function setupAdminListeners() {
    // Admin Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`admin${capitalizeFirst(tabName)}Tab`).classList.add('active');
        });
    });

    // Quiz Management
    document.getElementById('addDailyQuizBtn').addEventListener('click', showAddDailyQuizForm);
    document.getElementById('addTopicBtn').addEventListener('click', showAddTopicForm);

    // Papers Management
    document.getElementById('addPaperBtn').addEventListener('click', showAddPaperForm);

    // Channels Management
    document.getElementById('addChannelBtn').addEventListener('click', showAddChannelForm);

    // Apps Management
    document.getElementById('addAppBtn').addEventListener('click', showAddAppForm);

    // Help Management
    document.getElementById('addHelpBtn').addEventListener('click', showAddHelpForm);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

window.loadAdminData = async function () {
    await loadAdminDailyQuiz();
    await loadAdminTopics();
    await loadAdminPapers();
    await loadAdminChannels();
    await loadAdminApps();
    await loadAdminHelp();
}

// Helper function to render admin item
function renderAdminItem(content, editCallback, deleteCallback, id) {
    return `
        <div class="admin-item">
            <div class="admin-item-content">${content}</div>
            <div class="admin-item-actions">
                <button class="edit-btn" onclick="${editCallback}('${id}')">Edit</button>
                <button class="delete-btn" onclick="${deleteCallback}('${id}')">Delete</button>
            </div>
        </div>
    `;
}

// Helper function to create form
function createForm(fields, submitCallback, cancelCallback) {
    let html = '<div class="admin-item"><form style="width: 100%;">';
    
    fields.forEach(field => {
        html += `
            <div class="form-group">
                <label>${field.label}</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="${field.id}" rows="${field.rows || 3}" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`
                    : field.type === 'select'
                    ? `<select id="${field.id}" ${field.required ? 'required' : ''}>${field.options.map(opt => `<option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>${opt.text}</option>`).join('')}</select>`
                    : `<input type="${field.type || 'text'}" id="${field.id}" value="${field.value || ''}" ${field.required ? 'required' : ''}>`
                }
            </div>
        `;
    });
    
    html += `
        <button type="submit" class="btn-primary">${fields.submitText || 'Submit'}</button>
        <button type="button" class="btn-secondary" onclick="${cancelCallback}()">Cancel</button>
    </form></div>`;
    
    return html;
}
// ===== BULK QUIZ IMPORT =====
function showBulkDailyQuizForm() {
    const form = `
        <div class="admin-item" style="background: var(--primary-50); border: 2px dashed var(--primary-300);">
            <form id="bulkDailyQuizForm" style="width: 100%;">
                <h4 style="color: var(--primary-600); margin-bottom: 16px;">📝 Bulk Import Daily Quiz</h4>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">
                    Format: Question,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D)<br>
                    One question per line. Example:<br>
                    <code style="background: var(--bg-primary); padding: 8px; display: block; margin-top: 8px; border-radius: 4px;">
                    What is H2O?,Water,Oxygen,Hydrogen,Carbon,A<br>
                    What is CO2?,Water,Carbon Dioxide,Oxygen,Nitrogen,B
                    </code>
                </p>
                <div class="form-group">
                    <label>Paste Questions (CSV Format)</label>
                    <textarea id="bulkDailyQuizText" rows="10" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px; font-family: monospace;" required placeholder="Question,Option A,Option B,Option C,Option D,Correct Answer"></textarea>
                </div>
                <button type="submit" class="btn-primary">Import Questions</button>
                <button type="button" class="btn-secondary" onclick="loadAdminDailyQuiz()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('dailyQuizList').insertAdjacentHTML('afterbegin', form);
    
    document.getElementById('bulkDailyQuizForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = document.getElementById('bulkDailyQuizText').value.trim();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showMessage('Please enter at least one question', 'error');
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length !== 6) {
                errorCount++;
                continue;
            }
            
            const [question, optionA, optionB, optionC, optionD, correctOption] = parts;
            
            if (!['A', 'B', 'C', 'D'].includes(correctOption.toUpperCase())) {
                errorCount++;
                continue;
            }
            
            try {
                const response = await fetch(`${API_URL}/admin/quiz/daily`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        question,
                        optionA,
                        optionB,
                        optionC,
                        optionD,
                        correctOption: correctOption.toUpperCase()
                    })
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        showMessage(`Imported ${successCount} questions. ${errorCount} failed.`, successCount > 0 ? 'success' : 'error');
        loadAdminDailyQuiz();
        loadDailyQuiz();
    });
}

window.showBulkDailyQuizForm = showBulkDailyQuizForm;
// ===== DAILY QUIZ MANAGEMENT =====
async function loadAdminDailyQuiz() {
    try {
        const response = await fetch(`${API_URL}/quiz/daily`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById('dailyQuizList');
        
        if (response.ok && data) {
            container.innerHTML = renderAdminItem(
                `<strong>${data.question}</strong><br>
                A: ${data.optionA}<br>
                B: ${data.optionB}<br>
                C: ${data.optionC}<br>
                D: ${data.optionD}<br>
                <em>Correct: ${data.correctOption}</em>`,
                'editDailyQuiz',
                'deleteDailyQuiz',
                data._id
            );
        } else {
            container.innerHTML = '<p class="empty-message">No daily quiz</p>';
        }
    } catch (error) {
        console.error('Error loading admin daily quiz:', error);
    }
}

function showAddDailyQuizForm() {
    const form = createForm([
        { id: 'dqQuestion', label: 'Question', required: true },
        { id: 'dqOptionA', label: 'Option A', required: true },
        { id: 'dqOptionB', label: 'Option B', required: true },
        { id: 'dqOptionC', label: 'Option C', required: true },
        { id: 'dqOptionD', label: 'Option D', required: true },
        { 
            id: 'dqCorrect', 
            label: 'Correct Option', 
            type: 'select',
            options: [
                { value: 'A', text: 'A' },
                { value: 'B', text: 'B' },
                { value: 'C', text: 'C' },
                { value: 'D', text: 'D' }
            ],
            required: true 
        }
    ], null, 'loadAdminDailyQuiz');
    
    form.submitText = 'Add Daily Quiz';
    document.getElementById('dailyQuizList').innerHTML = form;
    
    document.querySelector('#dailyQuizList form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const quizData = {
            question: document.getElementById('dqQuestion').value,
            optionA: document.getElementById('dqOptionA').value,
            optionB: document.getElementById('dqOptionB').value,
            optionC: document.getElementById('dqOptionC').value,
            optionD: document.getElementById('dqOptionD').value,
            correctOption: document.getElementById('dqCorrect').value
        };

        try {
            const response = await fetch(`${API_URL}/admin/quiz/daily`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(quizData)
            });

            if (response.ok) {
                showMessage('Daily quiz added successfully', 'success');
                loadAdminDailyQuiz();
                loadDailyQuiz();
            } else {
                const data = await response.json();
                showMessage(data.message || 'Failed to add daily quiz', 'error');
            }
        } catch (error) {
            console.error('Error adding daily quiz:', error);
            showMessage('Error adding daily quiz', 'error');
        }
    });
}

window.editDailyQuiz = async function(id) {
    try {
        const response = await fetch(`${API_URL}/quiz/daily`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const form = createForm([
            { id: 'edqQuestion', label: 'Question', value: data.question, required: true },
            { id: 'edqOptionA', label: 'Option A', value: data.optionA, required: true },
            { id: 'edqOptionB', label: 'Option B', value: data.optionB, required: true },
            { id: 'edqOptionC', label: 'Option C', value: data.optionC, required: true },
            { id: 'edqOptionD', label: 'Option D', value: data.optionD, required: true },
            { 
                id: 'edqCorrect', 
                label: 'Correct Option', 
                type: 'select',
                value: data.correctOption,
                options: [
                    { value: 'A', text: 'A' },
                    { value: 'B', text: 'B' },
                    { value: 'C', text: 'C' },
                    { value: 'D', text: 'D' }
                ],
                required: true 
            }
        ], null, 'loadAdminDailyQuiz');
        
        document.getElementById('dailyQuizList').innerHTML = form;
        
        document.querySelector('#dailyQuizList form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const quizData = {
                question: document.getElementById('edqQuestion').value,
                optionA: document.getElementById('edqOptionA').value,
                optionB: document.getElementById('edqOptionB').value,
                optionC: document.getElementById('edqOptionC').value,
                optionD: document.getElementById('edqOptionD').value,
                correctOption: document.getElementById('edqCorrect').value
            };

            try {
                const response = await fetch(`${API_URL}/admin/quiz/daily/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(quizData)
                });

                if (response.ok) {
                    showMessage('Daily quiz updated successfully', 'success');
                    loadAdminDailyQuiz();
                    loadDailyQuiz();
                } else {
                    showMessage('Failed to update daily quiz', 'error');
                }
            } catch (error) {
                console.error('Error updating daily quiz:', error);
                showMessage('Error updating daily quiz', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading daily quiz for edit:', error);
    }
};

window.deleteDailyQuiz = async function(id) {
    if (!confirm('Are you sure you want to delete this daily quiz?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/quiz/daily/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Daily quiz deleted successfully', 'success');
            loadAdminDailyQuiz();
            loadDailyQuiz();
        } else {
            showMessage('Failed to delete daily quiz', 'error');
        }
    } catch (error) {
        console.error('Error deleting daily quiz:', error);
        showMessage('Error deleting daily quiz', 'error');
    }
};

// ===== TOPICS MANAGEMENT =====
async function loadAdminTopics() {
    try {
        const response = await fetch(`${API_URL}/quiz/topics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const topics = await response.json();

        const container = document.getElementById('topicsList');
        
        if (response.ok && topics.length > 0) {
            container.innerHTML = topics.map(topic => `
                <div class="topic-item">
                    <div class="topic-header">
                        <h4>${topic.name}</h4>
                        <div class="admin-item-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn-primary" onclick="showAddQuestionForm('${topic._id}')">Add Question</button>
                            <button class="btn-secondary" onclick="showBulkQuestionForm('${topic._id}')" style="background: var(--success-500); color: white; border: none;">📥 Bulk Import</button>
                            <button class="delete-btn" onclick="deleteTopic('${topic._id}')">Delete Topic</button>
                        </div>
                    </div>
                    <div id="questions-${topic._id}"></div>
                </div>
            `).join('');

            topics.forEach(topic => loadTopicQuestionsAdmin(topic._id));
        } else {
            container.innerHTML = '<p class="empty-message">No topics available</p>';
        }
    } catch (error) {
        console.error('Error loading admin topics:', error);
    }
}

async function loadTopicQuestionsAdmin(topicId) {
    try {
        const response = await fetch(`${API_URL}/quiz/topic/${topicId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const container = document.getElementById(`questions-${topicId}`);
        
        if (response.ok && data.questions.length > 0) {
            container.innerHTML = data.questions.map(q => `
                <div class="question-item">
                    <strong>${q.question}</strong><br>
                    A: ${q.optionA} | B: ${q.optionB} | C: ${q.optionC} | D: ${q.optionD}<br>
                    <em>Correct: ${q.correctOption}</em>
                    <div class="admin-item-actions">
                        <button class="edit-btn" onclick="editQuestion('${topicId}', '${q._id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteQuestion('${topicId}', '${q._id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="font-size: 14px; color: #6b7280; margin-top: 10px;">No questions yet</p>';
        }
    } catch (error) {
        console.error('Error loading topic questions:', error);
    }
}

function showAddTopicForm() {
    const form = `
        <div class="admin-item">
            <form id="addTopicForm">
                <div class="form-group">
                    <label>Topic Name</label>
                    <input type="text" id="topicName" required>
                </div>
                <button type="submit" class="btn-primary">Add Topic</button>
                <button type="button" class="btn-secondary" onclick="loadAdminTopics()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('topicsList').insertAdjacentHTML('afterbegin', form);
    
    document.getElementById('addTopicForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topicData = {
            name: document.getElementById('topicName').value
        };

        try {
            const response = await fetch(`${API_URL}/admin/quiz/topic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(topicData)
            });

            if (response.ok) {
                showMessage('Topic added successfully', 'success');
                loadAdminTopics();
                loadCompetitiveQuiz();
            } else {
                showMessage('Failed to add topic', 'error');
            }
        } catch (error) {
            console.error('Error adding topic:', error);
            showMessage('Error adding topic', 'error');
        }
    });
}

// ===== BULK COMPETITIVE QUIZ IMPORT =====
window.showBulkQuestionForm = function(topicId) {
    const form = `
        <div class="question-item" style="background: var(--success-50); border: 2px dashed var(--success-300);">
            <form id="bulkQuestionForm-${topicId}">
                <h4 style="color: var(--success-600); margin-bottom: 16px;">📥 Bulk Import Questions</h4>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">
                    Format: Question,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D)<br>
                    One question per line. Example:<br>
                    <code style="background: var(--bg-primary); padding: 8px; display: block; margin-top: 8px; border-radius: 4px;">
                    What is photosynthesis?,Process of making food,Respiration,Digestion,Circulation,A<br>
                    What is mitosis?,Cell division,Cell death,Cell growth,Cell mutation,A
                    </code>
                </p>
                <div class="form-group">
                    <label>Paste Questions (CSV Format)</label>
                    <textarea id="bulkQuestionText-${topicId}" rows="10" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px; font-family: monospace;" required placeholder="Question,Option A,Option B,Option C,Option D,Correct Answer"></textarea>
                </div>
                <button type="submit" class="btn-primary">Import Questions</button>
                <button type="button" class="btn-secondary" onclick="loadTopicQuestionsAdmin('${topicId}')">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById(`questions-${topicId}`).insertAdjacentHTML('afterbegin', form);
    
    document.getElementById(`bulkQuestionForm-${topicId}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = document.getElementById(`bulkQuestionText-${topicId}`).value.trim();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showMessage('Please enter at least one question', 'error');
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length !== 6) {
                errorCount++;
                continue;
            }
            
            const [question, optionA, optionB, optionC, optionD, correctOption] = parts;
            
            if (!['A', 'B', 'C', 'D'].includes(correctOption.toUpperCase())) {
                errorCount++;
                continue;
            }
            
            try {
                const response = await fetch(`${API_URL}/admin/quiz/topic/${topicId}/question`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        question,
                        optionA,
                        optionB,
                        optionC,
                        optionD,
                        correctOption: correctOption.toUpperCase()
                    })
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        showMessage(`Imported ${successCount} questions. ${errorCount} failed.`, successCount > 0 ? 'success' : 'error');
        loadTopicQuestionsAdmin(topicId);
    });
};
window.showAddQuestionForm = function(topicId) {
    const form = `
        <div class="question-item">
            <form id="addQuestionForm-${topicId}">
                <div class="form-group">
                    <label>Question</label>
                    <input type="text" id="qQuestion-${topicId}" required>
                </div>
                <div class="form-group">
                    <label>Option A</label>
                    <input type="text" id="qOptionA-${topicId}" required>
                </div>
                <div class="form-group">
                    <label>Option B</label>
                    <input type="text" id="qOptionB-${topicId}" required>
                </div>
                <div class="form-group">
                    <label>Option C</label>
                    <input type="text" id="qOptionC-${topicId}" required>
                </div>
                <div class="form-group">
                    <label>Option D</label>
                    <input type="text" id="qOptionD-${topicId}" required>
                </div>
                <div class="form-group">
                    <label>Correct Option</label>
                    <select id="qCorrect-${topicId}" required>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Add Question</button>
                <button type="button" class="btn-secondary" onclick="loadTopicQuestionsAdmin('${topicId}')">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById(`questions-${topicId}`).insertAdjacentHTML('afterbegin', form);
    
    document.getElementById(`addQuestionForm-${topicId}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const questionData = {
            question: document.getElementById(`qQuestion-${topicId}`).value,
            optionA: document.getElementById(`qOptionA-${topicId}`).value,
            optionB: document.getElementById(`qOptionB-${topicId}`).value,
            optionC: document.getElementById(`qOptionC-${topicId}`).value,
            optionD: document.getElementById(`qOptionD-${topicId}`).value,
            correctOption: document.getElementById(`qCorrect-${topicId}`).value
        };

        try {
            const response = await fetch(`${API_URL}/admin/quiz/topic/${topicId}/question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(questionData)
            });

            if (response.ok) {
                showMessage('Question added successfully', 'success');
                loadTopicQuestionsAdmin(topicId);
            } else {
                showMessage('Failed to add question', 'error');
            }
        } catch (error) {
            console.error('Error adding question:', error);
            showMessage('Error adding question', 'error');
        }
    });
};

window.deleteTopic = async function(topicId) {
    if (!confirm('Are you sure you want to delete this topic and all its questions?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/quiz/topic/${topicId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Topic deleted successfully', 'success');
            loadAdminTopics();
            loadCompetitiveQuiz();
        } else {
            showMessage('Failed to delete topic', 'error');
        }
    } catch (error) {
        console.error('Error deleting topic:', error);
        showMessage('Error deleting topic', 'error');
    }
};

window.deleteQuestion = async function(topicId, questionId) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/quiz/topic/${topicId}/question/${questionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Question deleted successfully', 'success');
            loadTopicQuestionsAdmin(topicId);
        } else {
            showMessage('Failed to delete question', 'error');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        showMessage('Error deleting question', 'error');
    }
};

// ===== PAPERS MANAGEMENT =====
async function loadAdminPapers() {
    try {
        const response = await fetch(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const papers = await response.json();

        const container = document.getElementById('papersList');
        
        if (response.ok && papers.length > 0) {
            container.innerHTML = papers.map(paper => renderAdminItem(
                `<strong>${paper.topicName}</strong><br>
                ${paper.description}<br>
                <a href="${paper.pdfUrl}" target="_blank">PDF Link</a>`,
                'editPaper',
                'deletePaper',
                paper._id
            )).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No papers available</p>';
        }
    } catch (error) {
        console.error('Error loading admin papers:', error);
    }
}

function showAddPaperForm() {
    const form = `
        <div class="admin-item">
            <form id="addPaperForm" style="width: 100%;">
                <div class="form-group">
                    <label>Topic Name</label>
                    <input type="text" id="paperTopic" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="paperDesc" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required></textarea>
                </div>
                <div class="form-group">
                    <label>PDF URL (Firebase)</label>
                    <input type="url" id="paperPdf" required>
                </div>
                <button type="submit" class="btn-primary">Add Paper</button>
                <button type="button" class="btn-secondary" onclick="loadAdminPapers()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('papersList').insertAdjacentHTML('afterbegin', form);
    
    document.getElementById('addPaperForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const paperData = {
            topicName: document.getElementById('paperTopic').value,
            description: document.getElementById('paperDesc').value,
            pdfUrl: document.getElementById('paperPdf').value
        };

        try {
            const response = await fetch(`${API_URL}/admin/papers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(paperData)
            });

            if (response.ok) {
                showMessage('Paper added successfully', 'success');
                loadAdminPapers();
                loadPapers();
            } else {
                showMessage('Failed to add paper', 'error');
            }
        } catch (error) {
            console.error('Error adding paper:', error);
            showMessage('Error adding paper', 'error');
        }
    });
}

window.editPaper = async function(id) {
    try {
        const response = await fetch(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const papers = await response.json();
        const paper = papers.find(p => p._id === id);

        const form = `
            <div class="admin-item">
                <form id="editPaperForm" style="width: 100%;">
                    <div class="form-group">
                        <label>Topic Name</label>
                        <input type="text" id="editPaperTopic" value="${paper.topicName}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editPaperDesc" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required>${paper.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>PDF URL (Firebase)</label>
                        <input type="url" id="editPaperPdf" value="${paper.pdfUrl}" required>
                    </div>
                    <button type="submit" class="btn-primary">Update Paper</button>
                    <button type="button" class="btn-secondary" onclick="loadAdminPapers()">Cancel</button>
                </form>
            </div>
        `;
        
        document.getElementById('papersList').innerHTML = form + document.getElementById('papersList').innerHTML;
        
        document.getElementById('editPaperForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const paperData = {
                topicName: document.getElementById('editPaperTopic').value,
                description: document.getElementById('editPaperDesc').value,
                pdfUrl: document.getElementById('editPaperPdf').value
            };

            try {
                const response = await fetch(`${API_URL}/admin/papers/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(paperData)
                });

                if (response.ok) {
                    showMessage('Paper updated successfully', 'success');
                    loadAdminPapers();
                    loadPapers();
                } else {
                    showMessage('Failed to update paper', 'error');
                }
            } catch (error) {
                console.error('Error updating paper:', error);
                showMessage('Error updating paper', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading paper for edit:', error);
    }
};

window.deletePaper = async function(id) {
    if (!confirm('Are you sure you want to delete this paper?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/papers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Paper deleted successfully', 'success');
            loadAdminPapers();
            loadPapers();
        } else {
            showMessage('Failed to delete paper', 'error');
        }
    } catch (error) {
        console.error('Error deleting paper:', error);
        showMessage('Error deleting paper', 'error');
    }
};

// ===== CHANNELS MANAGEMENT =====
async function loadAdminChannels() {
    try {
        const response = await fetch(`${API_URL}/channels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const channels = await response.json();

        const container = document.getElementById('channelsList');
        
        if (response.ok && channels.length > 0) {
            container.innerHTML = channels.map(channel => renderAdminItem(
                `<strong>${channel.name}</strong><br>
                ${channel.description}<br>
                <a href="${channel.url}" target="_blank">${channel.url}</a>`,
                'editChannel',
                'deleteChannel',
                channel._id
            )).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No channels available</p>';
        }
    } catch (error) {
        console.error('Error loading admin channels:', error);
    }
}

function showAddChannelForm() {
    const form = `
        <div class="admin-item">
            <form id="addChannelForm" style="width: 100%;">
                <div class="form-group">
                    <label>Channel Name</label>
                    <input type="text" id="channelName" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="channelDesc" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required></textarea>
                </div>
                <div class="form-group">
                    <label>Channel URL</label>
                    <input type="url" id="channelUrl" required>
                </div>
                <div class="form-group">
                    <label>Photo URL (Optional)</label>
                    <input type="url" id="channelPhoto" placeholder="https://example.com/image.jpg">
                </div>
                <button type="submit" class="btn-primary">Add Channel</button>
                <button type="button" class="btn-secondary" onclick="loadAdminChannels()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('channelsList').insertAdjacentHTML('afterbegin', form);
    
    document.getElementById('addChannelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const channelData = {
            name: document.getElementById('channelName').value,
            description: document.getElementById('channelDesc').value,
            url: document.getElementById('channelUrl').value,
            photoUrl: document.getElementById('channelPhoto').value.trim() || ''
        };

        try {
            const response = await fetch(`${API_URL}/admin/channels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(channelData)
            });

            if (response.ok) {
                showMessage('Channel added successfully', 'success');
                loadAdminChannels();
                loadChannels();
            } else {
                showMessage('Failed to add channel', 'error');
            }
        } catch (error) {
            console.error('Error adding channel:', error);
            showMessage('Error adding channel', 'error');
        }
    });
}

window.editChannel = async function(id) {
    try {
        const response = await fetch(`${API_URL}/channels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const channels = await response.json();
        const channel = channels.find(c => c._id === id);

        const form = `
            <div class="admin-item">
                <form id="editChannelForm" style="width: 100%;">
                    <div class="form-group">
                        <label>Channel Name</label>
                        <input type="text" id="editChannelName" value="${channel.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editChannelDesc" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required>${channel.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Channel URL</label>
                        <input type="url" id="editChannelUrl" value="${channel.url}" required>
                    </div>
                    <div class="form-group">
                        <label>Photo URL (Optional)</label>
                        <input type="url" id="editChannelPhoto" value="${channel.photoUrl || ''}" placeholder="https://example.com/image.jpg">
                    </div>
                    <button type="submit" class="btn-primary">Update Channel</button>
                    <button type="button" class="btn-secondary" onclick="loadAdminChannels()">Cancel</button>
                </form>
            </div>
        `;
        
        document.getElementById('channelsList').innerHTML = form + document.getElementById('channelsList').innerHTML;
        
        document.getElementById('editChannelForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const channelData = {
                name: document.getElementById('editChannelName').value,
                description: document.getElementById('editChannelDesc').value,
                url: document.getElementById('editChannelUrl').value,
                photoUrl: document.getElementById('editChannelPhoto').value
            };

            try {
                const response = await fetch(`${API_URL}/admin/channels/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(channelData)
                });

                if (response.ok) {
                    showMessage('Channel updated successfully', 'success');
                    loadAdminChannels();
                    loadChannels();
                } else {
                    showMessage('Failed to update channel', 'error');
                }
            } catch (error) {
                console.error('Error updating channel:', error);
                showMessage('Error updating channel', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading channel for edit:', error);
    }
};

window.deleteChannel = async function(id) {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/channels/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Channel deleted successfully', 'success');
            loadAdminChannels();
            loadChannels();
        } else {
            showMessage('Failed to delete channel', 'error');
        }
    } catch (error) {
        console.error('Error deleting channel:', error);
        showMessage('Error deleting channel', 'error');
    }
};

// ===== APPS MANAGEMENT =====
async function loadAdminApps() {
    try {
        const response = await fetch(`${API_URL}/apps`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const apps = await response.json();

        const container = document.getElementById('appsList');
        
        if (response.ok && apps.length > 0) {
            container.innerHTML = apps.map(app => renderAdminItem(
                `<strong>${app.name}</strong><br>
                ${app.features}<br>
                <a href="${app.downloadUrl}" target="_blank">Download Link</a>`,
                'editApp',
                'deleteApp',
                app._id
            )).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No apps available</p>';
        }
    } catch (error) {
        console.error('Error loading admin apps:', error);
    }
}

function showAddAppForm() {
    const form = `
        <div class="admin-item">
            <form id="addAppForm" style="width: 100%;">
                <div class="form-group">
                    <label>App Name</label>
                    <input type="text" id="appName" required>
                </div>
                <div class="form-group">
                    <label>Features</label>
                    <textarea id="appFeatures" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required></textarea>
                </div>
                <div class="form-group">
                    <label>Download URL</label>
                    <input type="url" id="appDownload" required>
                </div>
                <div class="form-group">
                    <label>Photo URL (Optional)</label>
                    <input type="url" id="appPhoto" placeholder="https://example.com/image.jpg">
                </div>
                <button type="submit" class="btn-primary">Add App</button>
                <button type="button" class="btn-secondary" onclick="loadAdminApps()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('appsList').insertAdjacentHTML('afterbegin', form);
    
    document.getElementById('addAppForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const appData = {
            name: document.getElementById('appName').value,
            features: document.getElementById('appFeatures').value,
            downloadUrl: document.getElementById('appDownload').value,
            photoUrl: document.getElementById('appPhoto').value
        };

        try {
            const response = await fetch(`${API_URL}/admin/apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(appData)
            });

            if (response.ok) {
                showMessage('App added successfully', 'success');
                loadAdminApps();
                loadApps();
            } else {
                showMessage('Failed to add app', 'error');
            }
        } catch (error) {
            console.error('Error adding app:', error);
            showMessage('Error adding app', 'error');
        }
    });
}

window.editApp = async function(id) {
    try {
        const response = await fetch(`${API_URL}/apps`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const apps = await response.json();
        const app = apps.find(a => a._id === id);

        const form = `
            <div class="admin-item">
                <form id="editAppForm" style="width: 100%;">
                    <div class="form-group">
                        <label>App Name</label>
                        <input type="text" id="editAppName" value="${app.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Features</label>
                        <textarea id="editAppFeatures" rows="3" style="width: 100%; padding: 12px; border: 2px solid var(--border-light); border-radius: 8px;" required>${app.features}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Download URL</label>
                        <input type="url" id="editAppDownload" value="${app.downloadUrl}" required>
                    </div>
                    <div class="form-group">
                        <label>Photo URL (Optional)</label>
                        <input type="url" id="editAppPhoto" value="${app.photoUrl || ''}" placeholder="https://example.com/image.jpg">
                    </div>
                    <button type="submit" class="btn-primary">Update App</button>
                    <button type="button" class="btn-secondary" onclick="loadAdminApps()">Cancel</button>
                </form>
            </div>
        `;
        
        document.getElementById('appsList').innerHTML = form + document.getElementById('appsList').innerHTML;
        
        document.getElementById('editAppForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const appData = {
                name: document.getElementById('editAppName').value,
                features: document.getElementById('editAppFeatures').value,
                downloadUrl: document.getElementById('editAppDownload').value,
                photoUrl: document.getElementById('editAppPhoto').value
            };

            try {
                const response = await fetch(`${API_URL}/admin/apps/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(appData)
                });

                if (response.ok) {
                    showMessage('App updated successfully', 'success');
                    loadAdminApps();
                    loadApps();
                } else {
                    showMessage('Failed to update app', 'error');
                }
            } catch (error) {
                console.error('Error updating app:', error);
                showMessage('Error updating app', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading app for edit:', error);
    }
};

window.deleteApp = async function(id) {
    if (!confirm('Are you sure you want to delete this app?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/apps/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('App deleted successfully', 'success');
            loadAdminApps();
            loadApps();
        } else {
            showMessage('Failed to delete app', 'error');
        }
    } catch (error) {
        console.error('Error deleting app:', error);
        showMessage('Error deleting app', 'error');
    }
};

// ===== HELP MANAGEMENT =====
async function loadAdminHelp() {
    try {
        const response = await fetch(`${API_URL}/help`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const help = await response.json();

        const container = document.getElementById('helpList');
        
        if (response.ok && help.pdfUrl) {
            container.innerHTML = renderAdminItem(
                `<strong>Help PDF</strong><br>
                <a href="${help.pdfUrl}" target="_blank">${help.pdfUrl}</a>`,
                'editHelp',
                'deleteHelp',
                help._id
            );
        } else {
            container.innerHTML = '<p class="empty-message">No help document set</p>';
        }
    } catch (error) {
        console.error('Error loading admin help:', error);
    }
}

function showAddHelpForm() {
    const form = `
        <div class="admin-item">
            <form id="addHelpForm" style="width: 100%;">
                <div class="form-group">
                    <label>PDF URL (Firebase)</label>
                    <input type="url" id="helpPdf" required>
                </div>
                <button type="submit" class="btn-primary">Set Help PDF</button>
                <button type="button" class="btn-secondary" onclick="loadAdminHelp()">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('helpList').innerHTML = form;
    
    document.getElementById('addHelpForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const helpData = {
            pdfUrl: document.getElementById('helpPdf').value
        };

        try {
            const response = await fetch(`${API_URL}/admin/help`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(helpData)
            });

            if (response.ok) {
                showMessage('Help PDF set successfully', 'success');
                loadAdminHelp();
            } else {
                showMessage('Failed to set help PDF', 'error');
            }
        } catch (error) {
            console.error('Error setting help:', error);
            showMessage('Error setting help PDF', 'error');
        }
    });
}

window.editHelp = async function(id) {
    try {
        const response = await fetch(`${API_URL}/help`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const help = await response.json();

        const form = `
            <div class="admin-item">
                <form id="editHelpForm" style="width: 100%;">
                    <div class="form-group">
                        <label>PDF URL (Firebase)</label>
                        <input type="url" id="editHelpPdf" value="${help.pdfUrl}" required>
                    </div>
                    <button type="submit" class="btn-primary">Update Help PDF</button>
                    <button type="button" class="btn-secondary" onclick="loadAdminHelp()">Cancel</button>
                </form>
            </div>
        `;
        
        document.getElementById('helpList').innerHTML = form;
        
        document.getElementById('editHelpForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const helpData = {
                pdfUrl: document.getElementById('editHelpPdf').value
            };

            try {
                const response = await fetch(`${API_URL}/admin/help/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(helpData)
                });

                if (response.ok) {
                    showMessage('Help PDF updated successfully', 'success');
                    loadAdminHelp();
                } else {
                    showMessage('Failed to update help PDF', 'error');
                }
            } catch (error) {
                console.error('Error updating help:', error);
                showMessage('Error updating help PDF', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading help for edit:', error);
    }
};

window.deleteHelp = async function(id) {
    if (!confirm('Are you sure you want to delete the help document?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/help/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Help PDF deleted successfully', 'success');
            loadAdminHelp();
        } else {
            showMessage('Failed to delete help PDF', 'error');
        }
    } catch (error) {
        console.error('Error deleting help:', error);
        showMessage('Error deleting help PDF', 'error');
    }
}