// ===========================
// AI Prompt Library V2
// ===========================
// Enhanced with Firebase authentication, cloud sync, folders, favorites, and dark mode

// ===========================
// Global Variables
// ===========================

let app, auth, db;
let currentUser = null;
let isFirebaseEnabled = false;
let unsubscribeAuth = null;

// ===========================
// Firebase Initialization
// ===========================

async function initializeFirebase() {
    try {
        // Wait a bit for firebase-config.js to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if Firebase SDK is available
        if (typeof firebase === 'undefined') {
            console.log('Firebase SDK not loaded - running in LocalStorage mode');
            return false;
        }

        // Check if config is available
        const config = window.firebaseConfig;
        const enabled = window.FIREBASE_ENABLED;

        if (!enabled || !config || config.apiKey === 'YOUR_API_KEY') {
            console.log('Firebase not configured - running in LocalStorage mode');
            return false;
        }

        // Initialize Firebase
        if (firebase.apps.length === 0) {
            app = firebase.initializeApp(config);
            auth = firebase.auth();
            db = firebase.firestore();

            // Enable offline persistence
            try {
                await db.enablePersistence({ synchronizeTabs: true });
                console.log('Firestore offline persistence enabled');
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn('Persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('Persistence not available');
                }
            }

            isFirebaseEnabled = true;
            console.log('Firebase initialized successfully');
            return true;
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// ===========================
// Data Management Class
// ===========================

class PromptLibraryV2 {
    constructor() {
        this.storageKey = 'aiPromptLibraryV2';
        this.foldersKey = 'aiPromptFoldersV2';
        this.settingsKey = 'aiPromptSettingsV2';

        this.prompts = this.loadLocalPrompts();
        this.folders = this.loadLocalFolders();
        this.settings = this.loadSettings();

        this.currentEditId = null;
        this.currentFolderId = 'all';
    }

    // ===========================
    // LocalStorage Operations
    // ===========================

    loadLocalPrompts() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading prompts:', error);
            return [];
        }
    }

    loadLocalFolders() {
        try {
            const data = localStorage.getItem(this.foldersKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading folders:', error);
            return [];
        }
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            const defaults = { theme: 'light', dismissedBanner: false };
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (error) {
            return { theme: 'light', dismissedBanner: false };
        }
    }

    saveLocalPrompts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.prompts));
        } catch (error) {
            console.error('Error saving prompts:', error);
            showToast('Error saving data', 'error');
        }
    }

    saveLocalFolders() {
        try {
            localStorage.setItem(this.foldersKey, JSON.stringify(this.folders));
        } catch (error) {
            console.error('Error saving folders:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // ===========================
    // Prompt Operations
    // ===========================

    addPrompt(title, text, category, tags, folderId = null, starred = false) {
        const prompt = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: currentUser ? currentUser.uid : null,
            title: title.trim(),
            text: text.trim(),
            category: category,
            tags: tags.filter(tag => tag.trim() !== '').map(tag => tag.trim()),
            folderId: folderId,
            starred: starred,
            dateAdded: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            lastUsed: null,
            useCount: 0,
            syncStatus: 'pending'
        };

        this.prompts.unshift(prompt);
        this.saveLocalPrompts();

        if (isFirebaseEnabled && currentUser) {
            this.syncPromptToCloud(prompt);
        }

        return prompt;
    }

    updatePrompt(id, title, text, category, tags, folderId = null, starred = false) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.prompts[index] = {
                ...this.prompts[index],
                title: title.trim(),
                text: text.trim(),
                category: category,
                tags: tags.filter(tag => tag.trim() !== '').map(tag => tag.trim()),
                folderId: folderId,
                starred: starred,
                dateModified: new Date().toISOString(),
                syncStatus: 'pending'
            };
            this.saveLocalPrompts();

            if (isFirebaseEnabled && currentUser) {
                this.syncPromptToCloud(this.prompts[index]);
            }

            return true;
        }
        return false;
    }

    deletePrompt(id) {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            const prompt = this.prompts[index];
            this.prompts.splice(index, 1);
            this.saveLocalPrompts();

            if (isFirebaseEnabled && currentUser && prompt.userId) {
                this.deletePromptFromCloud(id);
            }

            return true;
        }
        return false;
    }

    getPrompt(id) {
        return this.prompts.find(p => p.id === id);
    }

    toggleStar(id) {
        const prompt = this.getPrompt(id);
        if (prompt) {
            prompt.starred = !prompt.starred;
            prompt.dateModified = new Date().toISOString();
            prompt.syncStatus = 'pending';
            this.saveLocalPrompts();

            if (isFirebaseEnabled && currentUser) {
                this.syncPromptToCloud(prompt);
            }

            return prompt.starred;
        }
        return false;
    }

    incrementUseCount(id) {
        const prompt = this.getPrompt(id);
        if (prompt) {
            prompt.useCount++;
            prompt.lastUsed = new Date().toISOString();
            prompt.syncStatus = 'pending';
            this.saveLocalPrompts();

            if (isFirebaseEnabled && currentUser) {
                this.syncPromptToCloud(prompt);
            }
        }
    }

    getAllPrompts() {
        return [...this.prompts];
    }

    getPromptsByFolder(folderId) {
        if (folderId === 'all') {
            return this.getAllPrompts();
        } else if (folderId === 'favorites') {
            return this.prompts.filter(p => p.starred);
        } else {
            return this.prompts.filter(p => p.folderId === folderId);
        }
    }

    // ===========================
    // Folder Operations
    // ===========================

    addFolder(name, color = 'blue') {
        const folder = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: currentUser ? currentUser.uid : null,
            name: name.trim(),
            color: color,
            createdAt: new Date().toISOString(),
            order: this.folders.length
        };

        this.folders.push(folder);
        this.saveLocalFolders();

        if (isFirebaseEnabled && currentUser) {
            this.syncFolderToCloud(folder);
        }

        return folder;
    }

    deleteFolder(id) {
        const index = this.folders.findIndex(f => f.id === id);
        if (index !== -1) {
            const folder = this.folders[index];

            // Move prompts from this folder to no folder
            this.prompts.forEach(p => {
                if (p.folderId === id) {
                    p.folderId = null;
                    p.syncStatus = 'pending';
                }
            });

            this.folders.splice(index, 1);
            this.saveLocalFolders();
            this.saveLocalPrompts();

            if (isFirebaseEnabled && currentUser && folder.userId) {
                this.deleteFolderFromCloud(id);
            }

            return true;
        }
        return false;
    }

    getAllFolders() {
        return [...this.folders];
    }

    // ===========================
    // Cloud Sync Operations
    // ===========================

    async syncPromptToCloud(prompt) {
        if (!isFirebaseEnabled || !currentUser || !prompt.userId) return;

        try {
            updateSyncStatus('syncing');

            await db.collection('prompts').doc(prompt.id).set({
                ...prompt,
                syncStatus: 'synced'
            });

            // Update local status
            const localPrompt = this.getPrompt(prompt.id);
            if (localPrompt) {
                localPrompt.syncStatus = 'synced';
                this.saveLocalPrompts();
            }

            updateSyncStatus('synced');
        } catch (error) {
            console.error('Sync error:', error);
            updateSyncStatus('offline');
        }
    }

    async syncFolderToCloud(folder) {
        if (!isFirebaseEnabled || !currentUser || !folder.userId) return;

        try {
            await db.collection('folders').doc(folder.id).set(folder);
        } catch (error) {
            console.error('Folder sync error:', error);
        }
    }

    async deletePromptFromCloud(id) {
        if (!isFirebaseEnabled || !currentUser) return;

        try {
            await db.collection('prompts').doc(id).delete();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    async deleteFolderFromCloud(id) {
        if (!isFirebaseEnabled || !currentUser) return;

        try {
            await db.collection('folders').doc(id).delete();
        } catch (error) {
            console.error('Folder delete error:', error);
        }
    }

    async loadFromCloud() {
        if (!isFirebaseEnabled || !currentUser) return;

        updateSyncStatus('syncing');

        try {
            // Load prompts
            const promptsSnapshot = await db.collection('prompts')
                .where('userId', '==', currentUser.uid)
                .get();

            const cloudPrompts = [];
            promptsSnapshot.forEach(doc => {
                cloudPrompts.push(doc.data());
            });

            // Load folders
            const foldersSnapshot = await db.collection('folders')
                .where('userId', '==', currentUser.uid)
                .get();

            const cloudFolders = [];
            foldersSnapshot.forEach(doc => {
                cloudFolders.push(doc.data());
            });

            // Merge with local data
            this.mergeCloudData(cloudPrompts, cloudFolders);

            updateSyncStatus('synced');
        } catch (error) {
            console.error('Load from cloud error:', error);
            updateSyncStatus('offline');
        }
    }

    mergeCloudData(cloudPrompts, cloudFolders) {
        // Merge prompts: cloud takes precedence if newer
        cloudPrompts.forEach(cloudPrompt => {
            const localIndex = this.prompts.findIndex(p => p.id === cloudPrompt.id);
            if (localIndex === -1) {
                // New cloud prompt
                this.prompts.push(cloudPrompt);
            } else {
                // Update if cloud is newer
                const localDate = new Date(this.prompts[localIndex].dateModified);
                const cloudDate = new Date(cloudPrompt.dateModified);
                if (cloudDate > localDate) {
                    this.prompts[localIndex] = cloudPrompt;
                }
            }
        });

        // Merge folders
        cloudFolders.forEach(cloudFolder => {
            const localIndex = this.folders.findIndex(f => f.id === cloudFolder.id);
            if (localIndex === -1) {
                this.folders.push(cloudFolder);
            } else {
                this.folders[localIndex] = cloudFolder;
            }
        });

        this.saveLocalPrompts();
        this.saveLocalFolders();
    }

    async migrateToCloud() {
        if (!isFirebaseEnabled || !currentUser) return 0;

        updateSyncStatus('syncing');

        try {
            let count = 0;

            // Migrate prompts
            for (const prompt of this.prompts) {
                if (!prompt.userId) {
                    prompt.userId = currentUser.uid;
                    prompt.syncStatus = 'pending';
                    await this.syncPromptToCloud(prompt);
                    count++;
                }
            }

            // Migrate folders
            for (const folder of this.folders) {
                if (!folder.userId) {
                    folder.userId = currentUser.uid;
                    await this.syncFolderToCloud(folder);
                }
            }

            this.saveLocalPrompts();
            this.saveLocalFolders();

            updateSyncStatus('synced');
            return count;
        } catch (error) {
            console.error('Migration error:', error);
            updateSyncStatus('offline');
            throw error;
        }
    }

    // ===========================
    // Export/Import
    // ===========================

    exportPrompts() {
        return JSON.stringify({
            prompts: this.prompts,
            folders: this.folders,
            version: 2
        }, null, 2);
    }

    importPrompts(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            let importedCount = 0;

            // Handle V1 format (array of prompts)
            if (Array.isArray(data)) {
                data.forEach(oldPrompt => {
                    const newPrompt = {
                        ...oldPrompt,
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        userId: currentUser ? currentUser.uid : null,
                        folderId: null,
                        starred: oldPrompt.starred || false,
                        lastUsed: oldPrompt.lastUsed || null,
                        dateModified: oldPrompt.dateModified || oldPrompt.dateAdded,
                        syncStatus: 'pending'
                    };
                    this.prompts.unshift(newPrompt);
                    importedCount++;
                });
            }
            // Handle V2 format
            else if (data.version === 2) {
                // Import folders first
                if (data.folders && Array.isArray(data.folders)) {
                    data.folders.forEach(folder => {
                        const newFolder = {
                            ...folder,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            userId: currentUser ? currentUser.uid : null
                        };
                        this.folders.push(newFolder);
                    });
                    this.saveLocalFolders();
                }

                // Import prompts
                if (data.prompts && Array.isArray(data.prompts)) {
                    data.prompts.forEach(prompt => {
                        const newPrompt = {
                            ...prompt,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            userId: currentUser ? currentUser.uid : null,
                            syncStatus: 'pending'
                        };
                        this.prompts.unshift(newPrompt);
                        importedCount++;
                    });
                }
            }

            this.saveLocalPrompts();
            return importedCount;
        } catch (error) {
            console.error('Import error:', error);
            throw error;
        }
    }
}

// ===========================
// UI State
// ===========================

const library = new PromptLibraryV2();
let currentFilter = 'all';
let currentSort = 'dateDesc';
let searchQuery = '';

// ===========================
// DOM Elements
// ===========================

// Core elements
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

// V2 elements
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const bannerSignInBtn = document.getElementById('bannerSignInBtn');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const userPhoto = document.getElementById('userPhoto');
const authBanner = document.getElementById('authBanner');
const dismissBanner = document.getElementById('dismissBanner');
const foldersSidebar = document.getElementById('foldersSidebar');
const foldersContainer = document.getElementById('foldersContainer');
const addFolderBtn = document.getElementById('addFolderBtn');
const folderModal = document.getElementById('folderModal');
const closeFolderModal = document.getElementById('closeFolderModal');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const folderForm = document.getElementById('folderForm');
const darkModeToggle = document.getElementById('darkModeToggle');
const statsModal = document.getElementById('statsModal');
const closeStatsModal = document.getElementById('closeStatsModal');
const fabBtn = document.getElementById('fabBtn');

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    // Initialize Firebase
    await initializeFirebase();

    // Setup
    setupEventListeners();
    initializeTheme();
    initializeAuth();

    // Initial render
    renderAll();
}

// ===========================
// Authentication
// ===========================

function initializeAuth() {
    if (!isFirebaseEnabled) {
        // Show banner to encourage sign-in
        if (!library.settings.dismissedBanner) {
            authBanner.style.display = 'block';
        }
        return;
    }

    unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        currentUser = user;

        if (user) {
            // User signed in
            signInBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            userName.textContent = user.displayName || user.email;
            userPhoto.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}`;
            authBanner.style.display = 'none';
            foldersSidebar.style.display = 'block';
            document.getElementById('folderSelectGroup').style.display = 'block';
            document.getElementById('syncStatus').style.display = 'flex';

            // Load data from cloud
            await library.loadFromCloud();

            // Check if migration needed
            const localPromptsWithoutUser = library.prompts.filter(p => !p.userId);
            if (localPromptsWithoutUser.length > 0) {
                if (confirm(`Would you like to sync your ${localPromptsWithoutUser.length} local prompts to the cloud?`)) {
                    try {
                        const count = await library.migrateToCloud();
                        showToast(`${count} prompts synced to cloud!`, 'success');
                    } catch (error) {
                        showToast('Migration failed. Please try again.', 'error');
                    }
                }
            }

            renderAll();
        } else {
            // User signed out
            signInBtn.style.display = 'block';
            userProfile.style.display = 'none';
            if (!library.settings.dismissedBanner) {
                authBanner.style.display = 'block';
            }
            foldersSidebar.style.display = 'none';
            document.getElementById('folderSelectGroup').style.display = 'none';
            document.getElementById('syncStatus').style.display = 'none';

            renderAll();
        }
    });
}

async function signIn() {
    if (!isFirebaseEnabled) {
        alert('Firebase is not configured.\n\nTo enable cloud sync:\n1. Create a Firebase project at console.firebase.google.com\n2. Add your configuration to firebase-config.js\n3. Set FIREBASE_ENABLED = true\n\nSee README-V2.md for detailed instructions.');
        return;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showToast('Signed in successfully!', 'success');
    } catch (error) {
        console.error('Sign in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign in cancelled', 'error');
        } else {
            showToast('Sign in failed: ' + error.message, 'error');
        }
    }
}

async function signOut() {
    if (!isFirebaseEnabled) return;

    try {
        await auth.signOut();
        showToast('Signed out successfully', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('Sign out failed', 'error');
    }
}

function updateSyncStatus(status) {
    const syncStatus = document.getElementById('syncStatus');
    if (!syncStatus) return;

    const syncIcon = syncStatus.querySelector('.sync-icon');
    const syncText = syncStatus.querySelector('.sync-text');

    if (!currentUser) {
        syncStatus.style.display = 'none';
        return;
    }

    syncStatus.style.display = 'flex';
    syncStatus.className = 'sync-status ' + status;

    switch (status) {
        case 'synced':
            syncText.textContent = 'Synced';
            break;
        case 'syncing':
            syncText.textContent = 'Syncing...';
            break;
        case 'offline':
            syncText.textContent = 'Offline';
            break;
    }
}

// ===========================
// Theme Management
// ===========================

function initializeTheme() {
    let savedTheme = library.settings.theme;

    // Check system preference if no saved theme
    if (!savedTheme || savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'dark' : 'light';
    }

    applyTheme(savedTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (library.settings.theme === 'system') {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const sunIcon = darkModeToggle.querySelector('.sun-icon');
    const moonIcon = darkModeToggle.querySelector('.moon-icon');

    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function toggleTheme() {
    const currentTheme = library.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    library.settings.theme = newTheme;
    library.saveSettings();
    applyTheme(newTheme);
}

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
    // Authentication
    if (signInBtn) signInBtn.addEventListener('click', signIn);
    if (bannerSignInBtn) bannerSignInBtn.addEventListener('click', signIn);
    if (signOutBtn) signOutBtn.addEventListener('click', signOut);
    if (dismissBanner) dismissBanner.addEventListener('click', () => {
        authBanner.style.display = 'none';
        library.settings.dismissedBanner = true;
        library.saveSettings();
    });

    // Theme
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleTheme);

    // Prompt modal
    addPromptBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closePromptModal);
    cancelBtn.addEventListener('click', closePromptModal);
    promptModal.addEventListener('click', (e) => {
        if (e.target === promptModal) closePromptModal();
    });
    promptForm.addEventListener('submit', handleFormSubmit);

    // Folder modal
    if (addFolderBtn) addFolderBtn.addEventListener('click', openAddFolderModal);
    if (closeFolderModal) closeFolderModal.addEventListener('click', closeFolderModalFn);
    if (cancelFolderBtn) cancelFolderBtn.addEventListener('click', closeFolderModalFn);
    if (folderModal) folderModal.addEventListener('click', (e) => {
        if (e.target === folderModal) closeFolderModalFn();
    });
    if (folderForm) folderForm.addEventListener('submit', handleFolderFormSubmit);

    // Search and filters
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    sortSelect.addEventListener('change', handleSort);

    // Export/Import
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);

    // Stats modal
    if (fabBtn) fabBtn.addEventListener('click', openStatsModal);
    if (closeStatsModal) closeStatsModal.addEventListener('click', closeStatsModalFn);
    if (statsModal) statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) closeStatsModalFn();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePromptModal();
            closeFolderModalFn();
            closeStatsModalFn();
        }
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Sidebar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const folderId = item.getAttribute('data-folder');
            selectFolder(folderId);
        });
    });
}

// ===========================
// Modal Functions
// ===========================

function openAddModal() {
    library.currentEditId = null;
    modalTitle.textContent = 'Add New Prompt';
    promptForm.reset();
    populateFolderSelect();
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
    document.getElementById('promptFolder').value = prompt.folderId || '';
    document.getElementById('promptFavorite').checked = prompt.starred || false;

    populateFolderSelect();
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
    const folderId = document.getElementById('promptFolder').value || null;
    const starred = document.getElementById('promptFavorite').checked;

    if (library.currentEditId) {
        library.updatePrompt(library.currentEditId, title, text, category, tags, folderId, starred);
        showToast('Prompt updated successfully!', 'success');
    } else {
        library.addPrompt(title, text, category, tags, folderId, starred);
        showToast('Prompt added successfully!', 'success');
    }

    closePromptModal();
    renderAll();
}

function populateFolderSelect() {
    const folderSelect = document.getElementById('promptFolder');
    folderSelect.innerHTML = '<option value="">No Folder</option>';

    library.getAllFolders().forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
    });
}

// ===========================
// Folder Management
// ===========================

function openAddFolderModal() {
    folderModal.classList.add('active');
    document.getElementById('folderName').focus();
}

function closeFolderModalFn() {
    folderModal.classList.remove('active');
    folderForm.reset();
}

function handleFolderFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('folderName').value;
    const color = document.querySelector('input[name="folderColor"]:checked').value;

    library.addFolder(name, color);
    showToast('Folder created!', 'success');

    closeFolderModalFn();
    renderAll();
}

function selectFolder(folderId) {
    library.currentFolderId = folderId;

    // Update active states
    document.querySelectorAll('.nav-item, .folder-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeItem = document.querySelector(`[data-folder="${folderId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    renderPrompts();
}

function deleteFolder(id) {
    if (confirm('Delete this folder? Prompts will be moved to "No Folder".')) {
        library.deleteFolder(id);
        showToast('Folder deleted', 'success');
        library.currentFolderId = 'all';
        renderAll();
    }
}

// ===========================
// Render Functions
// ===========================

function renderAll() {
    renderFolders();
    renderPrompts();
    updateCounts();
}

function renderFolders() {
    if (!currentUser) return;

    foldersContainer.innerHTML = '';

    const folders = library.getAllFolders();
    folders.forEach(folder => {
        const folderEl = createFolderElement(folder);
        foldersContainer.appendChild(folderEl);
    });
}

function createFolderElement(folder) {
    const button = document.createElement('button');
    button.className = 'folder-item' + (library.currentFolderId === folder.id ? ' active' : '');
    button.setAttribute('data-folder', folder.id);
    button.onclick = () => selectFolder(folder.id);

    const colorMap = {
        blue: '#6366f1',
        green: '#10b981',
        purple: '#8b5cf6',
        orange: '#f97316',
        pink: '#ec4899',
        gray: '#64748b'
    };

    const promptCount = library.getPromptsByFolder(folder.id).length;

    button.innerHTML = `
        <div class="folder-icon" style="background: ${colorMap[folder.color]};"></div>
        <span>${escapeHtml(folder.name)}</span>
        <span class="count">${promptCount}</span>
        <div class="folder-actions">
            <button class="icon-btn" onclick="event.stopPropagation(); deleteFolder('${folder.id}')" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        </div>
    `;

    return button;
}

function updateCounts() {
    const allCount = document.getElementById('allCount');
    const favCount = document.getElementById('favCount');

    if (allCount) allCount.textContent = library.prompts.length;
    if (favCount) favCount.textContent = library.prompts.filter(p => p.starred).length;
}

function renderPrompts() {
    let prompts = library.getPromptsByFolder(library.currentFolderId);

    // Apply category filter
    if (currentFilter !== 'all' && currentFilter !== 'favorites') {
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

    const starClass = prompt.starred ? 'starred' : '';
    const starIcon = prompt.starred ? '⭐' : '☆';

    return `
        <div class="prompt-card" data-id="${prompt.id}">
            <div class="prompt-header">
                <h3 class="prompt-title">${escapeHtml(prompt.title)}</h3>
                <div class="prompt-actions">
                    <button class="star-btn ${starClass}" onclick="toggleStar('${prompt.id}')" title="${prompt.starred ? 'Unstar' : 'Star'}">
                        ${starIcon}
                    </button>
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

        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }

        renderAll();
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
        renderAll();
    }
}

function toggleStar(id) {
    library.toggleStar(id);
    renderAll();
}

// ===========================
// Search and Filter
// ===========================

function handleSearch(e) {
    searchQuery = e.target.value;
    renderPrompts();
}

function handleCategoryFilter(e) {
    currentFilter = e.target.value;
    if (currentFilter === 'favorites') {
        library.currentFolderId = 'favorites';
        selectFolder('favorites');
    }
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
        case 'lastUsed':
            return sorted.sort((a, b) => {
                if (!a.lastUsed) return 1;
                if (!b.lastUsed) return -1;
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            });
        default:
            return sorted;
    }
}

// ===========================
// Export/Import
// ===========================

function handleExport() {
    const data = library.exportPrompts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompts-v2-${new Date().toISOString().split('T')[0]}.json`;
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
            renderAll();
        } catch (error) {
            showToast('Failed to import prompts. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);

    e.target.value = '';
}

// ===========================
// Analytics
// ===========================

function openStatsModal() {
    calculateStats();
    statsModal.classList.add('active');
}

function closeStatsModalFn() {
    statsModal.classList.remove('active');
}

function calculateStats() {
    const prompts = library.getAllPrompts();

    // Basic stats
    document.getElementById('totalPromptsStatValue').textContent = prompts.length;
    document.getElementById('totalUsesStatValue').textContent = prompts.reduce((sum, p) => sum + p.useCount, 0);
    document.getElementById('favoriteCountStatValue').textContent = prompts.filter(p => p.starred).length;
    document.getElementById('folderCountStatValue').textContent = library.getAllFolders().length;

    // Top prompts
    const topPrompts = [...prompts]
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 5);

    const topPromptsHtml = topPrompts.length > 0
        ? topPrompts.map(p => `
            <div class="top-prompt-item">
                <span class="top-prompt-title">${escapeHtml(p.title)}</span>
                <span class="top-prompt-uses">${p.useCount} uses</span>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No prompts used yet</p>';

    document.getElementById('topPromptsListStats').innerHTML = topPromptsHtml;

    // Category breakdown
    const categories = {};
    prompts.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });

    const totalPrompts = prompts.length || 1;
    const categoryHtml = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => {
            const percentage = (count / totalPrompts) * 100;
            return `
                <div class="category-bar">
                    <span class="category-name">${escapeHtml(category)}</span>
                    <div class="category-progress">
                        <div class="category-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('');

    document.getElementById('categoryBreakdownStats').innerHTML = categoryHtml || '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No prompts yet</p>';
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
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// Make functions global for onclick handlers
// ===========================

window.openEditModal = openEditModal;
window.deletePrompt = deletePrompt;
window.copyPrompt = copyPrompt;
window.toggleStar = toggleStar;
window.selectFolder = selectFolder;
window.deleteFolder = deleteFolder;
