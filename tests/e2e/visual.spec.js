import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should match empty state screenshot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('empty-state.png')
  })

  test('should match prompt cards layout', async ({ page }) => {
    await page.goto('/')

    // Create a few test prompts
    const prompts = [
      {
        title: 'JavaScript Function',
        text: 'Write a JS function',
        category: 'Coding',
      },
      {
        title: 'Email Template',
        text: 'Professional email',
        category: 'Writing',
      },
      {
        title: 'Design Brief',
        text: 'Create a design brief',
        category: 'Design',
      },
    ]

    for (const prompt of prompts) {
      await page.click('#addPromptBtn')
      await page.fill('#promptTitle', prompt.title)
      await page.fill('#promptText', prompt.text)
      await page.selectOption('#promptCategory', prompt.category)
      await page.click('#savePromptBtn')
    }

    await expect(page).toHaveScreenshot('prompt-cards.png')
  })

  test('should match dark mode appearance', async ({ page }) => {
    await page.goto('/')

    // Switch to dark mode
    await page.click('#darkModeToggle')

    // Create a prompt to see dark mode styling
    await page.click('#addPromptBtn')
    await page.fill('#promptTitle', 'Dark Mode Test')
    await page.fill('#promptText', 'Testing dark mode')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#savePromptBtn')

    await expect(page).toHaveScreenshot('dark-mode.png')
  })

  test('should match modal appearance', async ({ page }) => {
    await page.goto('/')

    // Open add prompt modal
    await page.click('#addPromptBtn')

    await expect(page.locator('#promptModal')).toHaveScreenshot(
      'add-prompt-modal.png'
    )
  })

  test('should match mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Create a prompt
    await page.click('.fab')
    await page.fill('#promptTitle', 'Mobile Test')
    await page.fill('#promptText', 'Testing mobile layout')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#savePromptBtn')

    await expect(page).toHaveScreenshot('mobile-layout.png')
  })
})
