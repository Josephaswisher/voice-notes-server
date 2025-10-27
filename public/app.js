// API Configuration
const API_BASE = window.location.origin;
const API_KEY = localStorage.getItem('apiKey') || '';

// State
let allNotes = [];
let currentView = 'all';
let selectedNote = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkApiKey();
    loadNotes();
});

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentView = e.currentTarget.dataset.view;
            document.getElementById('view-title').textContent =
                e.currentTarget.querySelector('span').textContent;
            filterNotes();
        });
    });

    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(() => {
        filterNotes(searchInput.value);
    }, 300));

    document.getElementById('semantic-search-btn').addEventListener('click', () => {
        const query = searchInput.value;
        if (query) semanticSearch(query);
    });

    // Upload
    document.getElementById('upload-btn').addEventListener('click', () => {
        document.getElementById('upload-modal').classList.add('open');
    });

    document.getElementById('close-upload').addEventListener('click', () => {
        document.getElementById('upload-modal').classList.remove('open');
    });

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Summary
    document.getElementById('summary-btn').addEventListener('click', () => {
        document.getElementById('summary-modal').classList.add('open');
    });

    document.getElementById('close-summary').addEventListener('click', () => {
        document.getElementById('summary-modal').classList.remove('open');
    });

    document.querySelectorAll('.summary-option').forEach(btn => {
        btn.addEventListener('click', () => {
            generateSummary(btn.dataset.period);
        });
    });

    // Detail panel
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('detail-panel').classList.remove('open');
    });

    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        sortNotes(e.target.value);
    });
}

function checkApiKey() {
    if (!API_KEY) {
        const key = prompt('Enter your API key:');
        if (key) {
            localStorage.setItem('apiKey', key);
            location.reload();
        }
    }
}

async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/voice-notes`, {
            headers: { 'X-API-Key': API_KEY }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('apiKey');
                checkApiKey();
                return;
            }
            throw new Error('Failed to load notes');
        }

        allNotes = await response.json();
        renderNotes(allNotes);
        updateCounts();
        updateCategories();
    } catch (error) {
        console.error('Error loading notes:', error);
        showError('Failed to load notes');
    }
}

function renderNotes(notes) {
    const grid = document.getElementById('notes-grid');

    if (notes.length === 0) {
        grid.innerHTML = `
            <div class="loading">
                <i class="fas fa-inbox"></i>
                <p>No notes found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = notes.map(note => createNoteCard(note)).join('');

    // Add click listeners
    grid.querySelectorAll('.note-card').forEach((card, index) => {
        card.addEventListener('click', () => showNoteDetail(notes[index]));
    });
}

function createNoteCard(note) {
    const date = new Date(note.timestamp);
    const summary = note.aiAnalysis?.summary || note.transcription?.text?.substring(0, 150) + '...';
    const priority = note.aiAnalysis?.priority || 'low';
    const categories = note.aiAnalysis?.categories || [];

    return `
        <div class="note-card" data-id="${note.id}">
            <div class="note-card-header">
                <div>
                    <div class="note-title">${escapeHtml(note.title || 'Voice Note')}</div>
                    <div class="note-meta">
                        <span class="priority-badge priority-${priority}"></span>
                        <span>${formatDate(date)}</span>
                        <span>${note.duration || 0}s</span>
                    </div>
                </div>
            </div>
            <div class="note-summary">${escapeHtml(summary)}</div>
            ${categories.length > 0 ? `
                <div class="note-tags">
                    ${categories.slice(0, 3).map(cat => `<span class="tag">${escapeHtml(cat)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="note-actions">
                <button class="note-action-btn" onclick="event.stopPropagation(); playAudio('${note.audioPath}')">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="note-action-btn" onclick="event.stopPropagation(); downloadNote('${note.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;
}

function showNoteDetail(note) {
    selectedNote = note;
    const panel = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content');

    const date = new Date(note.timestamp);
    const analysis = note.aiAnalysis || {};

    content.innerHTML = `
        <h1 class="detail-title">${escapeHtml(note.title || 'Voice Note')}</h1>

        <div class="detail-meta">
            <div class="detail-meta-item">
                <i class="fas fa-calendar"></i>
                <span>${formatDate(date)}</span>
            </div>
            <div class="detail-meta-item">
                <i class="fas fa-clock"></i>
                <span>${note.duration || 0} seconds</span>
            </div>
            <div class="detail-meta-item">
                <i class="fas fa-circle priority-${analysis.priority || 'low'}"></i>
                <span>${(analysis.priority || 'low').toUpperCase()} Priority</span>
            </div>
            ${analysis.sentiment ? `
                <div class="detail-meta-item">
                    <i class="fas fa-smile"></i>
                    <span>${analysis.sentiment}</span>
                </div>
            ` : ''}
        </div>

        ${analysis.summary ? `
            <div class="detail-section">
                <h3>Summary</h3>
                <p>${escapeHtml(analysis.summary)}</p>
            </div>
        ` : ''}

        ${analysis.keyPoints && analysis.keyPoints.length > 0 ? `
            <div class="detail-section">
                <h3>Key Points</h3>
                <ul>
                    ${analysis.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${analysis.actionItems && analysis.actionItems.length > 0 ? `
            <div class="detail-section">
                <h3>Action Items</h3>
                ${analysis.actionItems.map(item => `
                    <div class="action-item">
                        <input type="checkbox">
                        <span>${escapeHtml(item)}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${analysis.categories && analysis.categories.length > 0 ? `
            <div class="detail-section">
                <h3>Categories</h3>
                <div class="note-tags">
                    ${analysis.categories.map(cat => `<span class="tag">${escapeHtml(cat)}</span>`).join('')}
                </div>
            </div>
        ` : ''}

        <div class="detail-section">
            <h3>Full Transcript</h3>
            <div class="transcript-text">${escapeHtml(note.transcription?.text || 'No transcript available')}</div>
        </div>

        <div class="detail-section">
            <h3>Audio</h3>
            <audio controls style="width: 100%;">
                <source src="${API_BASE}${note.audioPath}" type="audio/mpeg">
                Your browser does not support audio playback.
            </audio>
        </div>
    `;

    panel.classList.add('open');
}

async function handleFileUpload(file) {
    const uploadArea = document.getElementById('upload-area');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const uploadStatus = document.getElementById('upload-status');

    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'block';

    const formData = new FormData();
    formData.append('audio', file);

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                uploadStatus.textContent = `Uploading... ${Math.round(percentComplete)}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                uploadStatus.textContent = 'Processing...';
                setTimeout(() => {
                    document.getElementById('upload-modal').classList.remove('open');
                    uploadArea.style.display = 'block';
                    uploadProgress.style.display = 'none';
                    progressFill.style.width = '0%';
                    loadNotes();
                }, 1000);
            } else {
                throw new Error('Upload failed');
            }
        });

        xhr.addEventListener('error', () => {
            throw new Error('Upload failed');
        });

        xhr.open('POST', `${API_BASE}/upload`);
        xhr.setRequestHeader('X-API-Key', API_KEY);
        xhr.send(formData);

    } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed');
        uploadArea.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
}

async function semanticSearch(query) {
    try {
        const response = await fetch(`${API_BASE}/search/semantic?q=${encodeURIComponent(query)}`, {
            headers: { 'X-API-Key': API_KEY }
        });

        if (!response.ok) throw new Error('Search failed');

        const results = await response.json();
        renderNotes(results);
    } catch (error) {
        console.error('Search error:', error);
        showError('Semantic search failed');
    }
}

async function generateSummary(period) {
    const summaryResult = document.getElementById('summary-result');
    summaryResult.style.display = 'block';
    summaryResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating summary...';

    try {
        const response = await fetch(`${API_BASE}/summary/${period}`, {
            method: 'POST',
            headers: { 'X-API-Key': API_KEY }
        });

        if (!response.ok) throw new Error('Summary generation failed');

        const summary = await response.json();
        summaryResult.innerHTML = `<pre>${summary.summary}</pre>`;
    } catch (error) {
        console.error('Summary error:', error);
        summaryResult.innerHTML = '<p style="color: var(--danger);">Failed to generate summary</p>';
    }
}

function filterNotes(searchTerm = '') {
    let filtered = allNotes;

    // Apply view filter
    if (currentView === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(note => new Date(note.timestamp) >= today);
    } else if (currentView === 'starred') {
        filtered = filtered.filter(note => note.starred);
    }

    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(note =>
            (note.title && note.title.toLowerCase().includes(term)) ||
            (note.transcription?.text && note.transcription.text.toLowerCase().includes(term)) ||
            (note.aiAnalysis?.summary && note.aiAnalysis.summary.toLowerCase().includes(term))
        );
    }

    renderNotes(filtered);
}

function sortNotes(sortBy) {
    const sorted = [...allNotes];

    switch (sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            sorted.sort((a, b) => {
                const aPriority = priorityOrder[a.aiAnalysis?.priority] ?? 2;
                const bPriority = priorityOrder[b.aiAnalysis?.priority] ?? 2;
                return aPriority - bPriority;
            });
            break;
        case 'duration':
            sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
            break;
    }

    allNotes = sorted;
    renderNotes(allNotes);
}

function updateCounts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.getElementById('total-count').textContent = allNotes.length;
    document.getElementById('today-count').textContent =
        allNotes.filter(n => new Date(n.timestamp) >= today).length;
    document.getElementById('starred-count').textContent =
        allNotes.filter(n => n.starred).length;
}

function updateCategories() {
    const categories = new Map();

    allNotes.forEach(note => {
        if (note.aiAnalysis?.categories) {
            note.aiAnalysis.categories.forEach(cat => {
                categories.set(cat, (categories.get(cat) || 0) + 1);
            });
        }
    });

    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cat, count]) => `
            <button class="category-tag" data-category="${escapeHtml(cat)}">
                <i class="fas fa-circle"></i>
                <span>${escapeHtml(cat)}</span>
                <span style="margin-left: auto; opacity: 0.5;">${count}</span>
            </button>
        `).join('');

    // Add click listeners
    categoryList.querySelectorAll('.category-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const filtered = allNotes.filter(note =>
                note.aiAnalysis?.categories?.includes(category)
            );
            renderNotes(filtered);
            document.getElementById('view-title').textContent = `Category: ${category}`;
        });
    });
}

// Utility functions
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    alert(message);
}

function playAudio(audioPath) {
    const audio = new Audio(`${API_BASE}${audioPath}`);
    audio.play();
}

function downloadNote(noteId) {
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;

    const content = `
Voice Note: ${note.title || 'Untitled'}
Date: ${new Date(note.timestamp).toLocaleString()}
Duration: ${note.duration}s

${note.aiAnalysis?.summary ? `Summary:\n${note.aiAnalysis.summary}\n\n` : ''}

${note.aiAnalysis?.keyPoints ? `Key Points:\n${note.aiAnalysis.keyPoints.map(p => `- ${p}`).join('\n')}\n\n` : ''}

${note.aiAnalysis?.actionItems ? `Action Items:\n${note.aiAnalysis.actionItems.map(a => `- [ ] ${a}`).join('\n')}\n\n` : ''}

Transcript:
${note.transcription?.text || ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'voice-note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
