import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should not have accessibility violations on empty state', async ({
    page,
  }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility violations with prompts', async ({
    page,
  }) => {
    await page.goto('/')

    // Create a test prompt
    await page.click('#addPromptBtn')
    await page.fill('#promptTitle', 'Accessibility Test')
    await page.fill('#promptText', 'Testing accessibility')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#savePromptBtn')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility violations in modal', async ({
    page,
  }) => {
    await page.goto('/')

    // Open modal
    await page.click('#addPromptBtn')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility violations in dark mode', async ({
    page,
  }) => {
    await page.goto('/')

    // Switch to dark mode
    await page.click('#darkModeToggle')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Create a test prompt first
    await page.click('#addPromptBtn')
    await page.fill('#promptTitle', 'Keyboard Test')
    await page.fill('#promptText', 'Testing keyboard navigation')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#savePromptBtn')

    // Test Tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('#searchInput')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#categoryFilter')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#sortSelect')).toBeFocused()

    // Test Escape key
    await page.click('#addPromptBtn')
    await expect(page.locator('#promptModal')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('#promptModal')).not.toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')

    // Check for ARIA labels on interactive elements
    await expect(page.locator('#addPromptBtn')).toHaveAttribute('aria-label')
    await expect(page.locator('#searchInput')).toHaveAttribute('aria-label')
    await expect(page.locator('#darkModeToggle')).toHaveAttribute('aria-label')
  })

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/')

    // Check for live regions for dynamic content
    await expect(page.locator('[aria-live]')).toBeVisible()

    // Create a prompt and check if announcement is made
    await page.click('#addPromptBtn')
    await page.fill('#promptTitle', 'Announcement Test')
    await page.fill('#promptText', 'Testing announcements')
    await page.selectOption('#promptCategory', 'Testing')
    await page.click('#savePromptBtn')

    // Toast should have proper role
    await expect(page.locator('.toast')).toHaveAttribute('role', 'alert')
  })
})
