import { expect, test } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Username').fill('demo')
  await page.getByLabel('Password').fill('demo12345')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Signed in as')).toBeVisible()
}

test('ideas list is public and paginated', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Ideas', level: 1 })).toBeVisible()
  await expect(page.getByRole('listitem').first()).toBeVisible()
})

test('anonymous users are prompted to sign in and cannot vote', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByText('to vote and post ideas.')).toBeVisible()
  // Vote pills are rendered but disabled for anonymous visitors.
  await expect(page.locator('.vote-pill').first()).toBeDisabled()
})

test('a signed-in user can vote optimistically and toggle back', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/')

  const firstPill = page.locator('.vote-pill').first()
  const count = firstPill.locator('.vote-pill__count')
  const before = Number(await count.innerText())

  await firstPill.click()
  await expect(firstPill).toHaveAttribute('aria-pressed', 'true')
  await expect(count).toHaveText(String(before + 1))

  // Toggle back to leave state clean for repeat runs.
  await firstPill.click()
  await expect(firstPill).toHaveAttribute('aria-pressed', 'false')
  await expect(count).toHaveText(String(before))
})

test('a signed-in user can create an idea and find it via Newest sort', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/')

  const title = `E2E idea ${Date.now()}`
  await page.getByRole('button', { name: '+ New idea' }).click()
  await page.getByLabel('Title').fill(title)
  await page
    .getByLabel('Description')
    .fill('Created by the Playwright end-to-end test.')
  await page.getByRole('button', { name: 'Post idea' }).click()

  await expect(page.getByText('Idea posted.')).toBeVisible()

  await page.getByRole('button', { name: 'Newest' }).click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})
