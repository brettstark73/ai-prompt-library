import { describe, it, expect, beforeEach } from 'vitest'

describe('DOM Element Tests', () => {
  beforeEach(() => {
    // Set up complete DOM structure that matches index.html
    document.body.innerHTML = `
      <header class="header">
        <div class="container header-container">
          <div class="header-left">
            <h1 class="app-title">AI Prompt Library <span class="version-badge">V2</span></h1>
            <div id="syncStatus" class="sync-status" style="display: none;"></div>
          </div>
          <div class="header-right">
            <div class="auth-section">
              <div id="authBanner" class="auth-banner" style="display: none;"></div>
              <div id="authButtons" class="auth-buttons"></div>
              <div id="userInfo" class="user-info" style="display: none;"></div>
            </div>
            <button id="darkModeToggle" class="icon-btn" aria-label="Toggle dark mode"></button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container main-container">
          <aside class="sidebar" id="sidebar">
            <nav class="sidebar-nav">
              <ul class="nav-list">
                <li><button class="nav-item active" data-filter="all">All Prompts</button></li>
                <li><button class="nav-item" data-filter="favorites">Favorites</button></li>
              </ul>
              <div class="folders-section">
                <div class="folders-header">
                  <h3>Folders</h3>
                  <button id="addFolderBtn" class="icon-btn small">+</button>
                </div>
                <ul id="foldersList" class="folders-list"></ul>
              </div>
            </nav>
          </aside>

          <div class="content">
            <div class="toolbar">
              <div class="search-filter-section">
                <input type="text" id="searchInput" placeholder="Search prompts..." aria-label="Search prompts">
                <select id="categoryFilter" aria-label="Filter by category">
                  <option value="">All Categories</option>
                  <option value="Coding">Coding</option>
                  <option value="Writing">Writing</option>
                </select>
                <select id="sortSelect" aria-label="Sort prompts">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="category">By Category</option>
                  <option value="mostUsed">Most Used</option>
                  <option value="recentlyUsed">Recently Used</option>
                </select>
              </div>
              <div class="action-buttons">
                <button id="statsBtn" class="btn secondary">Stats</button>
                <button id="exportBtn" class="btn secondary">Export</button>
                <button id="importBtn" class="btn secondary">Import</button>
                <button id="addPromptBtn" class="btn primary">+ Add Prompt</button>
              </div>
            </div>

            <div id="promptsContainer" class="prompts-grid"></div>
            <div id="emptyState" class="empty-state">
              <h2>No prompts yet</h2>
              <p>Create your first prompt to get started!</p>
              <button class="btn primary">Add Your First Prompt</button>
            </div>
          </div>
        </div>
      </main>

      <!-- Modals -->
      <div id="promptModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modalTitle">Add New Prompt</h2>
            <button id="closeModal" class="close-btn">&times;</button>
          </div>
          <form id="promptForm" class="modal-body">
            <input type="text" id="promptTitle" placeholder="Prompt title" required>
            <textarea id="promptText" placeholder="Enter your prompt text here..." required></textarea>
            <select id="promptCategory" required>
              <option value="">Select Category</option>
              <option value="Coding">Coding</option>
              <option value="Writing">Writing</option>
            </select>
            <input type="text" id="promptTags" placeholder="Tags (comma-separated)">
            <select id="promptFolder">
              <option value="">No Folder</option>
            </select>
          </form>
          <div class="modal-footer">
            <button type="button" id="cancelBtn" class="btn secondary">Cancel</button>
            <button type="submit" id="savePromptBtn" class="btn primary">Save Prompt</button>
          </div>
        </div>
      </div>

      <div id="folderModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create New Folder</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <input type="text" id="folderName" placeholder="Folder name" required>
            <div class="color-picker">
              <div class="color-option" data-color="blue"></div>
              <div class="color-option" data-color="green"></div>
              <div class="color-option" data-color="purple"></div>
              <div class="color-option" data-color="orange"></div>
              <div class="color-option" data-color="red"></div>
              <div class="color-option" data-color="gray"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn secondary">Cancel</button>
            <button type="button" id="saveFolderBtn" class="btn primary">Create Folder</button>
          </div>
        </div>
      </div>

      <div id="statsModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Statistics</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Total Prompts</h3>
                <span id="totalPromptsCount" class="stat-number">0</span>
              </div>
              <div class="stat-card">
                <h3>Total Usage</h3>
                <span id="totalUsageCount" class="stat-number">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="fab" id="fabBtn" aria-label="Add new prompt">+</button>
      <div id="toastContainer" class="toast-container" aria-live="polite"></div>
    `
  })

  describe('Required Elements Exist', () => {
    it('should have all main navigation elements', () => {
      expect(document.getElementById('searchInput')).toBeTruthy()
      expect(document.getElementById('categoryFilter')).toBeTruthy()
      expect(document.getElementById('sortSelect')).toBeTruthy()
      expect(document.getElementById('addPromptBtn')).toBeTruthy()
    })

    it('should have all modal elements', () => {
      expect(document.getElementById('promptModal')).toBeTruthy()
      expect(document.getElementById('promptForm')).toBeTruthy()
      expect(document.getElementById('promptTitle')).toBeTruthy()
      expect(document.getElementById('promptText')).toBeTruthy()
      expect(document.getElementById('promptCategory')).toBeTruthy()
      expect(document.getElementById('savePromptBtn')).toBeTruthy()
      expect(document.getElementById('cancelBtn')).toBeTruthy()
    })

    it('should have content areas', () => {
      expect(document.getElementById('promptsContainer')).toBeTruthy()
      expect(document.getElementById('emptyState')).toBeTruthy()
      expect(document.getElementById('sidebar')).toBeTruthy()
    })

    it('should have dark mode toggle', () => {
      expect(document.getElementById('darkModeToggle')).toBeTruthy()
    })

    it('should have stats modal elements', () => {
      expect(document.getElementById('statsModal')).toBeTruthy()
      expect(document.getElementById('totalPromptsCount')).toBeTruthy()
      expect(document.getElementById('totalUsageCount')).toBeTruthy()
    })

    it('should have folder elements', () => {
      expect(document.getElementById('folderModal')).toBeTruthy()
      expect(document.getElementById('addFolderBtn')).toBeTruthy()
      expect(document.getElementById('foldersList')).toBeTruthy()
    })

    it('should have accessibility elements', () => {
      // Check aria-labels
      expect(
        document.querySelector('[aria-label="Toggle dark mode"]')
      ).toBeTruthy()
      expect(
        document.querySelector('[aria-label="Search prompts"]')
      ).toBeTruthy()
      expect(
        document.querySelector('[aria-label="Add new prompt"]')
      ).toBeTruthy()

      // Check aria-live region
      expect(document.querySelector('[aria-live="polite"]')).toBeTruthy()
    })
  })

  describe('Element Attributes', () => {
    it('should have correct input types and attributes', () => {
      const searchInput = document.getElementById('searchInput')
      expect(searchInput.type).toBe('text')
      expect(searchInput.placeholder).toBe('Search prompts...')

      const promptTitle = document.getElementById('promptTitle')
      expect(promptTitle.hasAttribute('required')).toBe(true)

      const promptText = document.getElementById('promptText')
      expect(promptText.tagName.toLowerCase()).toBe('textarea')
      expect(promptText.hasAttribute('required')).toBe(true)
    })

    it('should have correct select options', () => {
      const categoryFilter = document.getElementById('categoryFilter')
      const options = categoryFilter.querySelectorAll('option')
      expect(options.length).toBeGreaterThan(0)
      expect(options[0].value).toBe('')
      expect(options[0].textContent).toBe('All Categories')

      const sortFilter = document.getElementById('sortSelect')
      const sortOptions = sortFilter.querySelectorAll('option')
      expect(sortOptions.length).toBe(6)
      expect(sortOptions[0].value).toBe('newest')
    })

    it('should have proper modal structure', () => {
      const modal = document.getElementById('promptModal')
      expect(modal.classList.contains('modal')).toBe(true)
      expect(modal.style.display).toBe('none')

      const modalContent = modal.querySelector('.modal-content')
      expect(modalContent).toBeTruthy()

      const modalHeader = modal.querySelector('.modal-header')
      const modalBody = modal.querySelector('.modal-body')
      const modalFooter = modal.querySelector('.modal-footer')

      expect(modalHeader).toBeTruthy()
      expect(modalBody).toBeTruthy()
      expect(modalFooter).toBeTruthy()
    })
  })

  describe('Form Validation', () => {
    it('should have required fields', () => {
      const form = document.getElementById('promptForm')
      const requiredFields = form.querySelectorAll('[required]')

      expect(requiredFields.length).toBe(3) // title, text, category

      const titleField = document.getElementById('promptTitle')
      const textField = document.getElementById('promptText')
      const categoryField = document.getElementById('promptCategory')

      expect(titleField.hasAttribute('required')).toBe(true)
      expect(textField.hasAttribute('required')).toBe(true)
      expect(categoryField.hasAttribute('required')).toBe(true)
    })
  })

  describe('Color Picker', () => {
    it('should have color options for folders', () => {
      const colorPicker = document.querySelector('.color-picker')
      expect(colorPicker).toBeTruthy()

      const colorOptions = colorPicker.querySelectorAll('.color-option')
      expect(colorOptions.length).toBe(6)

      const expectedColors = [
        'blue',
        'green',
        'purple',
        'orange',
        'red',
        'gray',
      ]
      const renderedColors = Array.from(colorOptions).map(
        option => option.dataset.color
      )
      expect(renderedColors).toEqual(expectedColors)
    })
  })
})
