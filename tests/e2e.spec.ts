import { test, expect } from '@playwright/test';

test.describe('Job2Project E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Job2Project/);
    await expect(page.getByRole('heading', { name: 'Job2Project' })).toBeVisible();
  });

  test('can submit job description', async ({ page }) => {
    await page.goto('/');
    
    // Set API keys in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('job2project_api_keys', JSON.stringify({
        llmProvider: 'zhipu',
        openaiApiKey: 'test-key',
        openaiModel: 'glm-4-flash',
        tavilyApiKey: 'test-key',
        vercelToken: ''
      }));
    });
    await page.reload();
    
    // Submit job description
    const textarea = page.getByPlaceholder(/粘贴岗位描述/);
    await textarea.fill('React前端工程师，要求3年经验');
    await page.locator('button:has(svg)').last().click();
    
    // Should show processing state
    await expect(page.getByText('Agent 正在思考')).toBeVisible();
  });

  test('history page loads', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByRole('heading', { name: '历史任务' })).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();
  });
});
