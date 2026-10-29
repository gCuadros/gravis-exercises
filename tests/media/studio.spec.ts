import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('review controls render locally, preserve frames and export both animated takes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4174/')) external.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByText('PROTOTIPO 01 · SIN REVISAR')).toBeVisible();
  await expect(page.locator('#time')).toContainText('F000');
  await page.getByRole('button', { name: 'Fotograma siguiente', exact: true }).click();
  await expect(page.locator('#time')).toContainText('F001');
  await page.locator('#timeline').fill('81');
  await expect(page.locator('#time')).toContainText('F081');
  for (const angle of ['side', 'front', 'three']) {
    await page.locator('#view').selectOption(angle);
    await expect(page.locator('#time')).toContainText('F081');
  }
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await expect(page.locator('#time')).not.toContainText('F081');
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.locator('#mode').selectOption('loop');
  await expect(page.locator('#timeline')).toHaveAttribute('max', '120');
  await page.locator('#timeline').fill('120');
  await page.getByRole('button', { name: 'Fotograma siguiente', exact: true }).click();
  await expect(page.locator('#time')).toContainText('F120');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadEvent;
  const data = await readFile((await download.path())!);
  expect(data.toString('utf8', 0, 4)).toBe('glTF');
  expect(data.readUInt32LE(4)).toBe(2);
  const jsonLength = data.readUInt32LE(12);
  const gltf = JSON.parse(data.toString('utf8', 20, 20 + jsonLength)) as {
    animations: { name: string; channels: unknown[] }[];
    nodes: { name?: string; extras?: { technicalApproval?: boolean } }[];
  };
  expect(gltf.animations.map((a) => a.name)).toEqual(['squat_full_draft', 'squat_loop_draft']);
  expect(gltf.animations.every((a) => a.channels.length > 0)).toBe(true);
  expect(
    gltf.nodes.find((n) => n.name === 'Gravis_draft_squat_v1')?.extras?.technicalApproval,
  ).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
