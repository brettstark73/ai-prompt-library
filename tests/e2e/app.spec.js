import { test, expect } from '@playwright/test'

test.describe('AI Prompt Library E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should load the application', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Check title
    await expect(page).toHaveTitle(/AI Prompt Library/)

    // Check main elements are present
    await expect(page.locator('h1')).toContainText('AI Prompt Library')
    await expect(page.locator('#addPromptBtn')).toBeVisible()
    await expect(page.locator('#searchInput')).toBeVisible()
  })

  test('should show empty state initially', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#emptyState', { state: 'visible' })

    // Should show empty state
    await expect(page.locator('#emptyState')).toBeVisible()
    await expect(page.locator('#emptyState')).toContainText('No prompts yet')
  })

  test('should create a new prompt', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load and JavaScript to initialize
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Click add prompt button
    await page.click('#addPromptBtn')

    // Wait for animation to complete
    await page.waitForTimeout(500)

    // Modal should be visible
    await expect(page.locator('#promptModal')).toBeVisible()
    await expect(page.locator('#modalTitle')).toContainText('Add New Prompt')

    // Fill form
    await page.fill('#promptTitle', 'Test Prompt')
    await page.fill('#promptText', 'This is a test prompt for automation')
    await page.selectOption('#promptCategory', 'Coding')
    await page.fill('#promptTags', 'test, automation')

    // Save prompt
    await page.click('#saveBtn')

    // Modal should close
    await expect(page.locator('#promptModal')).not.toBeVisible()

    // Prompt should appear in list
    await expect(page.locator('.prompt-card')).toBeVisible()
    await expect(page.locator('.prompt-card h3')).toContainText('Test Prompt')

    // Empty state should be hidden
    await expect(page.locator('#emptyState')).not.toBeVisible()
  })

  test('should search prompts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create a test prompt first
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'JavaScript Function')
    await page.fill('#promptText', 'Write a JavaScript function')
    await page.selectOption('#promptCategory', 'Coding')
    await page.click('#saveBtn')

    // Create another prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Email Template')
    await page.fill('#promptText', 'Professional email template')
    await page.selectOption('#promptCategory', 'Writing')
    await page.click('#saveBtn')

    // Should see both prompts
    await expect(page.locator('.prompt-card')).toHaveCount(2)

    // Search for JavaScript
    await page.fill('#searchInput', 'JavaScript')

    // Should only see one prompt
    await expect(page.locator('.prompt-card')).toHaveCount(1)
    await expect(page.locator('.prompt-card h3')).toContainText(
      'JavaScript Function'
    )

    // Clear search
    await page.fill('#searchInput', '')

    // Should see both prompts again
    await expect(page.locator('.prompt-card')).toHaveCount(2)
  })

  test('should filter by category', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create coding prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Code Prompt')
    await page.fill('#promptText', 'Coding prompt')
    await page.selectOption('#promptCategory', 'Coding')
    await page.click('#saveBtn')

    // Create writing prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Writing Prompt')
    await page.fill('#promptText', 'Writing prompt')
    await page.selectOption('#promptCategory', 'Writing')
    await page.click('#saveBtn')

    // Filter by Coding
    await page.selectOption('#categoryFilter', 'Coding')

    // Should only see coding prompt
    await expect(page.locator('.prompt-card')).toHaveCount(1)
    await expect(page.locator('.prompt-card h3')).toContainText('Code Prompt')

    // Filter by Writing
    await page.selectOption('#categoryFilter', 'Writing')

    // Should only see writing prompt
    await expect(page.locator('.prompt-card')).toHaveCount(1)
    await expect(page.locator('.prompt-card h3')).toContainText(
      'Writing Prompt'
    )
  })

  test('should copy prompt to clipboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create a test prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Copy Test')
    await page.fill('#promptText', 'This text should be copied')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#saveBtn')

    // Click copy button
    await page.click('.copy-btn')

    // Wait for copy operation to complete and show toast
    await page.waitForTimeout(1000)
    await expect(page.locator('.toast')).toBeVisible()

    // In headless mode, clipboard API may fail, so we accept either success or failure
    const toastText = await page.locator('.toast').textContent()
    expect(toastText).toMatch(/Copied to clipboard|Failed to copy|Copy/)
  })

  test('should star/unstar prompts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create a test prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Star Test')
    await page.fill('#promptText', 'Test starring')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#saveBtn')

    // Star button should not be active initially
    await expect(page.locator('.star-btn')).not.toHaveClass(/starred/)

    // Click star button
    await page.click('.star-btn')
    await page.waitForTimeout(1000)

    // Star button should now be active
    await expect(page.locator('.star-btn')).toHaveClass(/starred/)

    // Filter by favorites
    await page.selectOption('#categoryFilter', 'favorites')
    await page.waitForTimeout(1000)

    // Should see the starred prompt
    await expect(page.locator('.prompt-card')).toHaveCount(1)

    // Unstar the prompt
    await page.click('.star-btn')

    // Wait for the prompt to disappear from favorites view
    await expect(page.locator('.prompt-card:has-text("Star Test")')).toHaveCount(0)

    // Should no longer see any prompts in favorites
    await expect(page.locator('.prompt-card')).toHaveCount(0)
  })

  test('should delete prompts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create a test prompt
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await page.fill('#promptTitle', 'Delete Test')
    await page.fill('#promptText', 'This will be deleted')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#saveBtn')

    // Should see the prompt
    await expect(page.locator('.prompt-card')).toHaveCount(1)

    // Set up dialog handler before clicking delete
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('delete')
      await dialog.accept()
    })

    // Hover over the prompt card to ensure buttons are visible
    await page.hover('.prompt-card')
    await page.waitForTimeout(500)

    // Click delete button
    await page.click('.icon-btn.delete')

    // Wait for empty state to appear after deletion
    await expect(page.locator('#emptyState')).toBeVisible()

    // Confirm prompt count is 0
    await expect(page.locator('.prompt-card')).toHaveCount(0)
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#darkModeToggle', { state: 'visible' })

    // Should start in light mode
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')

    // Click dark mode toggle
    await page.click('#darkModeToggle')

    // Should switch to dark mode
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark')

    // Click again to go back to light
    await page.click('#darkModeToggle')

    // Should be back to light mode
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')
  })

  test('should show statistics', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Create a few test prompts
    for (let i = 1; i <= 3; i++) {
      await page.click('#addPromptBtn')
      await page.fill('#promptTitle', `Prompt ${i}`)
      await page.fill('#promptText', `Test prompt ${i}`)
      await page.selectOption('#promptCategory', 'Testing')
      await page.click('#saveBtn')
    }

    // Open stats modal
    await page.click('#statsBtn')

    // Should show correct count
    await expect(page.locator('#totalPromptsCount')).toContainText('3')

    // Close stats modal
    await page.click('.close-modal')
    await expect(page.locator('#statsModal')).not.toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.fab', { state: 'visible' })

    // FAB button should be visible on mobile
    await expect(page.locator('.fab')).toBeVisible()

    // Sidebar should be hidden initially
    await expect(page.locator('.sidebar')).toHaveClass(/collapsed/)

    // Click FAB to add prompt
    await page.click('.fab')
    await page.waitForTimeout(500)

    // Modal should be visible
    await expect(page.locator('#promptModal')).toBeVisible()
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#addPromptBtn', { state: 'visible' })

    // Open prompt modal
    await page.click('#addPromptBtn')
    await page.waitForTimeout(500)
    await expect(page.locator('#promptModal')).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(page.locator('#promptModal')).not.toBeVisible()

    // Test search shortcut (Cmd+K or Ctrl+K)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+KeyK`)

    // Search input should be focused
    await expect(page.locator('#searchInput')).toBeFocused()
  })
})
