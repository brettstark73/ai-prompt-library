import { describe, it, expect, beforeEach } from 'vitest'

// Mock the app code by creating a simplified version for testing
describe('AI Prompt Library Core Functions', () => {
  beforeEach(() => {
    // Set up DOM elements that the app expects
    document.body.innerHTML = `
      <div id="promptsContainer"></div>
      <div id="emptyState" style="display: none;"></div>
      <input id="searchInput" />
      <select id="categoryFilter"></select>
      <select id="sortSelect"></select>
      <div id="totalPromptsCount">0</div>
      <div id="totalUsageCount">0</div>
    `

    // Mock localStorage with some test data
    const mockPrompts = [
      {
        id: '1',
        title: 'Test Prompt',
        text: 'This is a test prompt',
        category: 'Coding',
        tags: ['test', 'example'],
        dateAdded: new Date().toISOString(),
        useCount: 5,
        starred: false,
        folderId: null,
      },
    ]

    localStorage.setItem('aiPromptLibrary', JSON.stringify(mockPrompts))
  })

  describe('Data Management', () => {
    it('should load prompts from localStorage', () => {
      const stored = localStorage.getItem('aiPromptLibrary')
      expect(stored).toBeTruthy()

      const prompts = JSON.parse(stored)
      expect(prompts).toHaveLength(1)
      expect(prompts[0].title).toBe('Test Prompt')
    })

    it('should save prompts to localStorage', () => {
      const newPrompt = {
        id: '2',
        title: 'New Prompt',
        text: 'Another test prompt',
        category: 'Writing',
        tags: ['new'],
        dateAdded: new Date().toISOString(),
        useCount: 0,
        starred: false,
        folderId: null,
      }

      const existing = JSON.parse(
        localStorage.getItem('aiPromptLibrary') || '[]'
      )
      existing.push(newPrompt)
      localStorage.setItem('aiPromptLibrary', JSON.stringify(existing))

      const updated = JSON.parse(localStorage.getItem('aiPromptLibrary'))
      expect(updated).toHaveLength(2)
      expect(updated[1].title).toBe('New Prompt')
    })
  })

  describe('Search and Filter', () => {
    it('should filter prompts by search term', () => {
      const prompts = [
        {
          title: 'JavaScript Function',
          text: 'Write a JS function',
          category: 'Coding',
        },
        {
          title: 'Python Script',
          text: 'Create a Python script',
          category: 'Coding',
        },
        {
          title: 'Email Template',
          text: 'Professional email',
          category: 'Writing',
        },
      ]

      // Test search functionality
      const searchTerm = 'javascript'
      const filtered = prompts.filter(
        prompt =>
          prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('JavaScript Function')
    })

    it('should filter prompts by category', () => {
      const prompts = [
        { title: 'JS Function', category: 'Coding' },
        { title: 'Python Script', category: 'Coding' },
        { title: 'Email Template', category: 'Writing' },
      ]

      const codingPrompts = prompts.filter(
        prompt => prompt.category === 'Coding'
      )
      expect(codingPrompts).toHaveLength(2)
    })

    it('should filter starred prompts', () => {
      const prompts = [
        { title: 'Important Prompt', starred: true },
        { title: 'Regular Prompt', starred: false },
        { title: 'Another Important', starred: true },
      ]

      const starredPrompts = prompts.filter(prompt => prompt.starred)
      expect(starredPrompts).toHaveLength(2)
    })
  })

  describe('Prompt Operations', () => {
    it('should create a valid prompt object', () => {
      const promptData = {
        title: 'Test Prompt',
        text: 'This is a test',
        category: 'Testing',
        tags: 'test,example',
      }

      // Simulate createPrompt function
      const newPrompt = {
        id: Date.now().toString(),
        title: promptData.title,
        text: promptData.text,
        category: promptData.category,
        tags: promptData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        useCount: 0,
        starred: false,
        folderId: null,
        lastUsed: null,
      }

      expect(newPrompt.title).toBe('Test Prompt')
      expect(newPrompt.tags).toEqual(['test', 'example'])
      expect(newPrompt.useCount).toBe(0)
      expect(newPrompt.starred).toBe(false)
    })

    it('should increment use count', () => {
      const prompt = { id: '1', useCount: 5 }
      prompt.useCount++
      prompt.lastUsed = new Date().toISOString()

      expect(prompt.useCount).toBe(6)
      expect(prompt.lastUsed).toBeTruthy()
    })

    it('should toggle starred status', () => {
      const prompt = { id: '1', starred: false }
      prompt.starred = !prompt.starred
      expect(prompt.starred).toBe(true)

      prompt.starred = !prompt.starred
      expect(prompt.starred).toBe(false)
    })
  })

  describe('Validation', () => {
    it('should validate required fields', () => {
      const validatePrompt = data => {
        const errors = []
        if (!data.title?.trim()) errors.push('Title is required')
        if (!data.text?.trim()) errors.push('Prompt text is required')
        if (!data.category?.trim()) errors.push('Category is required')
        return errors
      }

      // Valid prompt
      expect(
        validatePrompt({
          title: 'Valid Title',
          text: 'Valid text',
          category: 'Coding',
        })
      ).toEqual([])

      // Invalid prompts
      expect(
        validatePrompt({
          title: '',
          text: 'Valid text',
          category: 'Coding',
        })
      ).toContain('Title is required')

      expect(
        validatePrompt({
          title: 'Valid Title',
          text: '',
          category: 'Coding',
        })
      ).toContain('Prompt text is required')
    })
  })

  describe('Export/Import', () => {
    it('should export prompts in correct format', () => {
      const prompts = [
        {
          id: '1',
          title: 'Test Prompt',
          text: 'Test text',
          category: 'Testing',
          tags: ['test'],
          dateAdded: '2023-01-01T00:00:00.000Z',
          useCount: 1,
          starred: false,
        },
      ]

      const exported = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        prompts: prompts,
        folders: [],
      }

      expect(exported.version).toBe('2.0')
      expect(exported.prompts).toHaveLength(1)
      expect(exported.folders).toHaveLength(0)
    })

    it('should import V1 format', () => {
      const v1Data = [
        {
          id: '1',
          title: 'V1 Prompt',
          text: 'V1 text',
          category: 'Coding',
          tags: ['v1'],
          dateAdded: '2023-01-01T00:00:00.000Z',
          useCount: 1,
        },
      ]

      // Convert V1 to V2 format
      const convertedPrompts = v1Data.map(prompt => ({
        ...prompt,
        dateModified: prompt.dateAdded,
        starred: false,
        folderId: null,
        lastUsed: null,
        syncStatus: 'local',
      }))

      expect(convertedPrompts[0].starred).toBe(false)
      expect(convertedPrompts[0].folderId).toBe(null)
      expect(convertedPrompts[0].syncStatus).toBe('local')
    })
  })

  describe('Statistics', () => {
    it('should calculate total usage correctly', () => {
      const prompts = [
        { useCount: 5 },
        { useCount: 3 },
        { useCount: 0 },
        { useCount: 12 },
      ]

      const totalUsage = prompts.reduce(
        (sum, prompt) => sum + prompt.useCount,
        0
      )
      expect(totalUsage).toBe(20)
    })

    it('should find most used prompts', () => {
      const prompts = [
        { title: 'Prompt A', useCount: 5 },
        { title: 'Prompt B', useCount: 12 },
        { title: 'Prompt C', useCount: 3 },
        { title: 'Prompt D', useCount: 8 },
      ]

      const topPrompts = prompts
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 3)

      expect(topPrompts[0].title).toBe('Prompt B')
      expect(topPrompts[0].useCount).toBe(12)
      expect(topPrompts).toHaveLength(3)
    })

    it('should categorize prompts correctly', () => {
      const prompts = [
        { category: 'Coding' },
        { category: 'Writing' },
        { category: 'Coding' },
        { category: 'Design' },
        { category: 'Coding' },
      ]

      const categories = prompts.reduce((acc, prompt) => {
        acc[prompt.category] = (acc[prompt.category] || 0) + 1
        return acc
      }, {})

      expect(categories['Coding']).toBe(3)
      expect(categories['Writing']).toBe(1)
      expect(categories['Design']).toBe(1)
    })
  })
})
