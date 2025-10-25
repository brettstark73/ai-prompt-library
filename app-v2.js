// ===========================
// Data Management
// ===========================

class PromptLibrary {
    constructor() {
        this.storageKey = 'aiPromptLibrary';
        this.prompts = this.loadPrompts();
        this.currentEditId = null;
    }

    // Load prompts from LocalStorage
    loadPrompts() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading prompts:', error);
            return [];
        }
    }

    // Save prompts to LocalStorage
    savePrompts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.prompts));
        } catch (error) {
            console.error('Error saving prompts:', error);
            showToast('Error saving data', 'error');
        }
    }

    // Create a new prompt
    addPrompt(title, text, category, tags) {
        const prompt = {
            id: Date.now().toString(),
            title: title.trim(),
            text: text.trim(),
            category: category,
            tags: tags.filter(tag => tag.trim() !== '').map(tag => tag.trim()),
            dateAdded: new Date().toISOString(),
            useCount: 0
        };

        this.prompts.unshift(prompt);
        this.savePrompts();
        return prompt;
    }

    // Update an existing prompt
    updatePrompt(id, title, text, category, tags) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.prompts[index] = {
                ...this.prompts[index],
                title: title.trim(),
                text: text.trim(),
                category: category,
                tags: tags.filter(tag => tag.trim() !== '').map(tag => tag.trim())
            };
            this.savePrompts();
            return true;
        }
        return false;
    }

    // Delete a prompt
    deletePrompt(id) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.prompts.splice(index, 1);
            this.savePrompts();
            return true;
        }
        return false;
    }

    // Get a single prompt by id
    getPrompt(id) {
        return this.prompts.find(p => p.id === id);
    }

    // Increment use count
    incrementUseCount(id) {
        const prompt = this.getPrompt(id);
        if (prompt) {
            prompt.useCount++;
            this.savePrompts();
        }
    }

    // Get all prompts
    getAllPrompts() {
        return [...this.prompts];
    }

    // Export prompts as JSON
    exportPrompts() {
        return JSON.stringify(this.prompts, null, 2);
    }

    // Import prompts from JSON
    importPrompts(jsonData) {
        try {
            const importedPrompts = JSON.parse(jsonData);
            if (!Array.isArray(importedPrompts)) {
                throw new Error('Invalid data format');
            }

            // Validate imported data
            const validPrompts = importedPrompts.filter(p => {
                return p.title && p.text && p.category;
            });

            // Merge with existing prompts, avoiding duplicates
            validPrompts.forEach(importedPrompt => {
                // Assign new ID to avoid conflicts
                importedPrompt.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            });

            this.prompts = [...validPrompts, ...this.prompts];
            this.savePrompts();
            return validPrompts.length;
        } catch (error) {
            console.error('Error importing prompts:', error);
            throw error;
        }
    }
}

// ===========================
// UI Management
// ===========================

const library = new PromptLibrary();
let currentFilter = 'all';
let currentSort = 'dateDesc';
let searchQuery = '';

// DOM Elements
const promptsContainer = document.getElementById('promptsContainer');
const emptyState = document.getElementById('emptyState');
const promptModal = document.getElementById('promptModal');
const promptForm = document.getElementById('promptForm');
const addPromptBtn = document.getElementById('addPromptBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderPrompts();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Modal controls
    addPromptBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closePromptModal);
    cancelBtn.addEventListener('click', closePromptModal);

    // Click outside modal to close
    promptModal.addEventListener('click', (e) => {
        if (e.target === promptModal) {
            closePromptModal();
        }
    });

    // Form submission
    promptForm.addEventListener('submit', handleFormSubmit);

    // Search and filters
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    sortSelect.addEventListener('change', handleSort);

    // Export/Import
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && promptModal.classList.contains('active')) {
            closePromptModal();
        }
    });
}

// ===========================
// Modal Functions
// ===========================

function openAddModal() {
    library.currentEditId = null;
    modalTitle.textContent = 'Add New Prompt';
    promptForm.reset();
    promptModal.classList.add('active');
    document.getElementById('promptTitle').focus();
}

function openEditModal(id) {
    const prompt = library.getPrompt(id);
    if (!prompt) return;

    library.currentEditId = id;
    modalTitle.textContent = 'Edit Prompt';

    document.getElementById('promptTitle').value = prompt.title;
    document.getElementById('promptText').value = prompt.text;
    document.getElementById('promptCategory').value = prompt.category;
    document.getElementById('promptTags').value = prompt.tags.join(', ');

    promptModal.classList.add('active');
    document.getElementById('promptTitle').focus();
}

function closePromptModal() {
    promptModal.classList.remove('active');
    promptForm.reset();
    library.currentEditId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('promptTitle').value;
    const text = document.getElementById('promptText').value;
    const category = document.getElementById('promptCategory').value;
    const tagsInput = document.getElementById('promptTags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    if (library.currentEditId) {
        // Update existing prompt
        library.updatePrompt(library.currentEditId, title, text, category, tags);
        showToast('Prompt updated successfully!', 'success');
    } else {
        // Add new prompt
        library.addPrompt(title, text, category, tags);
        showToast('Prompt added successfully!', 'success');
    }

    closePromptModal();
    renderPrompts();
}

// ===========================
// Render Functions
// ===========================

function renderPrompts() {
    let prompts = library.getAllPrompts();

    // Apply filters
    if (currentFilter !== 'all') {
        prompts = prompts.filter(p => p.category === currentFilter);
    }

    // Apply search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        prompts = prompts.filter(p => {
            return (
                p.title.toLowerCase().includes(query) ||
                p.text.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });
    }

    // Apply sorting
    prompts = sortPrompts(prompts, currentSort);

    // Render
    if (prompts.length === 0) {
        promptsContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        promptsContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        promptsContainer.innerHTML = prompts.map(createPromptCard).join('');
    }
}

function createPromptCard(prompt) {
    const truncatedText = prompt.text.length > 150
        ? prompt.text.substring(0, 150) + '...'
        : prompt.text;

    const tagsHtml = prompt.tags.length > 0
        ? `<div class="prompt-tags">
            ${prompt.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
           </div>`
        : '';

    return `
        <div class="prompt-card" data-id="${prompt.id}">
            <div class="prompt-header">
                <h3 class="prompt-title">${escapeHtml(prompt.title)}</h3>
                <div class="prompt-actions">
                    <button class="icon-btn edit" onclick="openEditModal('${prompt.id}')" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn delete" onclick="deletePrompt('${prompt.id}')" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="prompt-text">${escapeHtml(truncatedText)}</p>
            <div class="prompt-meta">
                <span class="category-badge">${escapeHtml(prompt.category)}</span>
                ${tagsHtml}
            </div>
            <div class="prompt-footer">
                <span class="use-count">Used ${prompt.useCount} times</span>
                <button class="copy-btn" onclick="copyPrompt('${prompt.id}')">
                    Copy
                </button>
            </div>
        </div>
    `;
}

// ===========================
// Action Functions
// ===========================

function copyPrompt(id) {
    const prompt = library.getPrompt(id);
    if (!prompt) return;

    navigator.clipboard.writeText(prompt.text).then(() => {
        library.incrementUseCount(id);
        showToast('Copied to clipboard!', 'success');

        // Update button visual feedback
        const card = document.querySelector(`[data-id="${id}"]`);
        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);

        renderPrompts();
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

function deletePrompt(id) {
    const prompt = library.getPrompt(id);
    if (!prompt) return;

    if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
        library.deletePrompt(id);
        showToast('Prompt deleted', 'success');
        renderPrompts();
    }
}

// ===========================
// Search and Filter Functions
// ===========================

function handleSearch(e) {
    searchQuery = e.target.value;
    renderPrompts();
}

function handleCategoryFilter(e) {
    currentFilter = e.target.value;
    renderPrompts();
}

function handleSort(e) {
    currentSort = e.target.value;
    renderPrompts();
}

function sortPrompts(prompts, sortType) {
    const sorted = [...prompts];

    switch (sortType) {
        case 'dateDesc':
            return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        case 'dateAsc':
            return sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        case 'alphabetical':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'category':
            return sorted.sort((a, b) => a.category.localeCompare(b.category));
        case 'mostUsed':
            return sorted.sort((a, b) => b.useCount - a.useCount);
        default:
            return sorted;
    }
}

// ===========================
// Export/Import Functions
// ===========================

function handleExport() {
    const data = library.exportPrompts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Prompts exported successfully!', 'success');
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const count = library.importPrompts(event.target.result);
            showToast(`${count} prompts imported successfully!`, 'success');
            renderPrompts();
        } catch (error) {
            showToast('Failed to import prompts. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
}

// ===========================
// Utility Functions
// ===========================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions global for onclick handlers
window.openEditModal = openEditModal;
window.deletePrompt = deletePrompt;
window.copyPrompt = copyPrompt;
