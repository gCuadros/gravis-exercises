import { test, expect } from '@playwright/test';
import { loadCatalogue, validateCatalogue } from '../../scripts/lib.mjs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { searchFixtures } from '../fixtures/exercises.mjs';
const entries = await loadCatalogue();
// Select a real, stable identity; translations and the number/order of matches can change.
const target = entries.find((exercise) => exercise.id === 'grv_000000000002');
if (!target) throw new Error('The band-assisted pull-up reference identity is missing');
const card = (page, exercise) =>
  page.locator(`.exercise-card[href="/exercises/${exercise.slug}/"]`);

for (const expanded of [false, true]) {
  test.describe(expanded ? 'expanded catalogue' : 'source catalogue', () => {
    const additions = expanded ? searchFixtures() : [];

    test.beforeEach(async ({ page }) => {
      if (!expanded) return;
      // Change only this browser's root response. No source/build/package file is changed.
      await page.route(
        (url) => url.pathname === '/',
        async (route) => {
          const response = await route.fetch();
          const html = await response.text();
          const pattern =
            /(<script id="page-data" type="application\/json">)([\s\S]*?)(<\/script>)/;
          const match = html.match(pattern);
          expect(match, 'The real page must expose its embedded catalogue').not.toBeNull();
          const payload = JSON.parse(match[2]);
          payload.exercises.push(...additions);
          expect(validateCatalogue(payload.exercises)).toEqual([]);
          const json = JSON.stringify(payload).replaceAll('<', '\\u003c');
          await route.fulfill({
            response,
            body: html.replace(pattern, () => match[1] + json + match[3]),
          });
        },
      );
    });

    test('search, combined filters, reload, empty state and clearing work together', async ({
      page,
    }) => {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/');
      await expect(page.locator('.exercise-card')).toHaveCount(entries.length + additions.length);
      await page.getByRole('searchbox').fill('dominada');
      await expect(card(page, target)).toBeVisible();
      if (expanded) {
        for (const fixture of additions.slice(0, 3))
          await expect(card(page, fixture)).toBeVisible();
        await expect(card(page, additions[3])).toHaveCount(0);
      }
      await page.locator('#discipline').selectOption('calisthenics');
      await page.locator('#equipment').selectOption('band');
      await expect(card(page, target)).toBeVisible();
      if (expanded) {
        await expect(card(page, additions[0])).toBeVisible();
        await expect(card(page, additions[1])).toHaveCount(0); // Wrong equipment.
        await expect(card(page, additions[2])).toHaveCount(0); // Wrong discipline.
      }
      const url = new URL(page.url());
      expect(Object.fromEntries(url.searchParams)).toEqual({
        q: 'dominada',
        discipline: 'calisthenics',
        equipment: 'band',
      });
      await page.reload();
      await expect(page.getByRole('searchbox')).toHaveValue('dominada');
      await expect(page.locator('#discipline')).toHaveValue('calisthenics');
      await expect(page.locator('#equipment')).toHaveValue('band');
      await expect(card(page, target)).toBeVisible();
      await page.getByRole('searchbox').fill('no-such-gravis-regression-fixture-490c');
      await expect(page.locator('.exercise-card')).toHaveCount(0);
      await expect(page.getByText('No matching movements.')).toBeVisible();
      await page.locator('.empty').getByRole('button', { name: 'Clear filters' }).click();
      await expect(page.locator('.exercise-card')).toHaveCount(entries.length + additions.length);
      await expect(page.getByRole('searchbox')).toBeFocused();
      await expect(page.getByRole('searchbox')).toHaveValue('');
      await expect(page.locator('#discipline')).toHaveValue('all');
      await expect(page.locator('#equipment')).toHaveValue('all');
      expect(new URL(page.url()).search).toBe('');
      expect(errors).toEqual([]);
    });

    test('language survives choosing an identity among matches and direct loading', async ({
      page,
    }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Cambiar a español' }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await page.getByRole('searchbox').fill('dominada');
      if (expanded) await expect(card(page, additions[1])).toBeVisible();
      await card(page, target).click();
      expect(new URL(page.url()).pathname).toBe(`/exercises/${target.slug}/`);
      await expect(page.getByRole('heading', { name: target.names.es, exact: true })).toBeVisible();
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(page.getByRole('heading', { name: target.names.es, exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Switch to English' }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.getByRole('heading', { name: target.names.en, exact: true })).toBeVisible();
    });

    test('catalogue and detail fit narrow screens without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 812 });
      for (const route of ['/', `/exercises/${target.slug}/`]) {
        await page.goto(route);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    });

    test('exported datasets contain exactly the real source records and return real 404s', async ({
      page,
      request,
    }) => {
      await page.goto('/');
      const preview = await (await request.get('/data/catalogue.preview.json')).json();
      const published = await (await request.get('/data/catalogue.published.json')).json();
      const schemaResponse = await request.get('/schema/catalogue.schema.json');
      expect(schemaResponse.status()).toBe(200);
      const ajv = new Ajv2020({ strict: true });
      addFormats(ajv);
      const validate = ajv.compile(await schemaResponse.json());
      expect(validate(preview)).toBe(true);
      expect(validate(published)).toBe(true);
      expect(preview.channel).toBe('preview');
      expect(published.channel).toBe('published');
      expect(preview.exercises).toEqual(entries);
      expect(published.exercises).toEqual(
        entries.filter((exercise) => exercise.status === 'published'),
      );
      for (const fixture of additions) {
        expect(preview.exercises.map((exercise) => exercise.id)).not.toContain(fixture.id);
        expect((await request.get(`/exercises/${fixture.slug}/`)).status()).toBe(404);
      }
      for (const route of [
        '/.local/research/gravis-catalogue-v0.1.json',
        '/package.json',
        '/exercises/not-found/',
      ]) {
        expect((await request.get(route)).status()).toBe(404);
      }
    });

    test('package utilities run in a browser with multiple matching records', async ({ page }) => {
      await page.goto('/');
      const ids = await page.evaluate(async (extra) => {
        const { createCatalogue } = await import('/assets/catalogue.js');
        const data = await (await fetch('/data/catalogue.preview.json')).json();
        data.exercises.push(...extra);
        return createCatalogue(data)
          .findExercises({ query: 'dominada' })
          .map((exercise) => exercise.id);
      }, additions);
      expect(ids).toContain(target.id);
      if (expanded) {
        for (const fixture of additions.slice(0, 3)) expect(ids).toContain(fixture.id);
        expect(ids).not.toContain(additions[3].id);
      }
    });
  });
}
