import { test, expect } from '@playwright/test';
import { loadCatalogue } from '../../scripts/lib.mjs';
const entries = await loadCatalogue();

test('search, shareable filters, empty state and clearing work together', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.exercise-card')).toHaveCount(entries.length);
  await page.getByRole('searchbox').fill('dominada');
  await expect(page.locator('.exercise-card')).toHaveCount(1);
  await expect(page).toHaveURL(/q=dominada/);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('dominada');
  await page.locator('#equipment').selectOption('barbell');
  await expect(page.getByText('No matching movements.')).toBeVisible();
  await page.locator('.empty').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.exercise-card')).toHaveCount(entries.length);
  await expect(page.getByRole('searchbox')).toBeFocused();
  expect(errors).toEqual([]);
});

test('language survives deep navigation and direct exercise loading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cambiar a español' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('searchbox').fill('dominada');
  await page.locator('.exercise-card').click();
  await expect(
    page.getByRole('heading', { name: 'Dominada asistida con banda', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByText('Demostración pendiente', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('catalogue and detail fit narrow screens without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  for (const route of ['/', `/exercises/${entries[0].slug}/`]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('the site exposes only authored datasets and returns real 404s', async ({ request }) => {
  const preview = await (await request.get('/data/catalogue.preview.json')).json();
  const published = await (await request.get('/data/catalogue.published.json')).json();
  expect(preview.exercises).toHaveLength(entries.length);
  expect(published.exercises).toEqual(
    entries.filter((exercise) => exercise.status === 'published'),
  );
  for (const route of [
    '/.local/research/gravis-catalogue-v0.1.json',
    '/package.json',
    '/exercises/not-found/',
  ]) {
    expect((await request.get(route)).status()).toBe(404);
  }
});

test('package utilities run in a browser without Node globals or a framework', async ({ page }) => {
  await page.goto('/');
  const count = await page.evaluate(async () => {
    const { createCatalogue } = await import('/assets/catalogue.js');
    const data = await (await fetch('/data/catalogue.preview.json')).json();
    return createCatalogue(data).findExercises({ query: 'dominada' }).length;
  });
  expect(count).toBe(1);
});
