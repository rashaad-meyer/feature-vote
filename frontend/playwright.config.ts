import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. Boots the Django API (migrated + seeded) and the Vite dev
 * server, reusing already-running instances when present.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command:
        'python manage.py migrate && python manage.py seed_demo && python manage.py runserver 8000',
      cwd: '../backend',
      url: 'http://localhost:8000/api/ideas/',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
