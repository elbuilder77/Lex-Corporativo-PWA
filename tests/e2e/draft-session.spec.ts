import { test, expect, type Page, type TestInfo, type Route } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';

const policy = JSON.parse(await readFile(new URL('../../vercel.json', import.meta.url), 'utf8'))
  .headers.find((rule: { source: string }) => rule.source === '/(.*)').headers
  .find((header: { key: string }) => header.key === 'Content-Security-Policy').value;

test.beforeEach(async ({ context }) => {
  // Preview lacks deployment headers. Exercise the exact configured CSP, with
  // real IndexedDB, real SQLite WASM and the production bundle (no storage mocks).
  const routeHandler = async (route: Route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': policy } });
  };
  await context.route('http://127.0.0.1:4175/**', routeHandler);
  await context.route('http://localhost:4175/**', routeHandler);
});

const status = (page: Page) => page.getByRole('status', { name: 'Estado del borrador' });
const title = (page: Page) => page.getByLabel('Título del documento', { exact: true });
const editor = (page: Page) => page.getByLabel('Contenido editable del documento');

async function expectSaved(page: Page, timeout = 7_000) {
  // Tolerate both desktop ("Guardado en este dispositivo") and mobile ("Guardado") status copy,
  // and give async IndexedDB debounced saves time to settle.
  await expect(status(page)).toHaveText(/Guardad[oa](?:.*dispositivo)?/i, { timeout });
}

async function capture(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: info.project.name !== 'mobile' });
}
async function openTemplate(page: Page, info?: TestInfo) {
  await page.goto('/?tab=estudio');
  const catalog = page.getByRole('dialog', { name: 'Catálogo de instrumentos y plantillas' });
  if (info) {
    await expect(catalog).toBeVisible();
    await capture(page, info, '00-catalogo');
  }
  await catalog.getByRole('button', { name: /^Mercantil Pagaré Mercantil/ }).click();
  await expect(editor(page)).toContainText('PAGARÉ');
  await expectSaved(page);
  await closeToasts(page);
}
async function closeToasts(page: Page) {
  // Dismiss via close button and remove overlay containers directly from DOM to prevent actionability blockage
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Cerrar"]').forEach((b) => (b as HTMLElement).click());
    document.querySelectorAll('.animate-fadeIn, .animate-slideUp').forEach((el) => el.remove());
  }).catch(() => {});
  await page.waitForTimeout(50);
}

test('conserva edición inmediata al salir y al recargar, con CSP de producción', async ({ page }, info) => {
  await openTemplate(page, info);
  await closeToasts(page);
  await editor(page).fill('CLÁUSULA DE PRUEBA. Conservar todo el trabajo.');
  await title(page).fill('Contrato de aceptación');
  const navLawBtn = page.getByRole('button', { name: /^(Fundamentador Jurídico|Fundamentos|Leyes)$/ });
  await navLawBtn.scrollIntoViewIfNeeded();
  await navLawBtn.click();
  await expect(page.getByRole('heading', { name: 'Fundamentador Jurídico Federal' })).toBeVisible();
  const navStudioBtn = page.getByRole('button', { name: /^(Ingeniería Jurídica|Ingeniería)$/ });
  await navStudioBtn.scrollIntoViewIfNeeded();
  await navStudioBtn.click();
  await expect(title(page)).toHaveValue('Contrato de aceptación');
  await expect(editor(page)).toContainText('Conservar todo el trabajo.');
  await page.reload();
  await closeToasts(page);
  await expect(title(page)).toHaveValue('Contrato de aceptación');
  await expect(editor(page)).toContainText('Conservar todo el trabajo.');
  await expectSaved(page);
  await capture(page, info, '01-editor-recuperado');
  await editor(page).scrollIntoViewIfNeeded();
  await capture(page, info, '01b-contenido-recuperado');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('recibe y exporta cita normativa sobre el borrador recuperado y vuelve con Atrás', async ({ page }, info) => {
  await openTemplate(page);
  await title(page).fill('Documento con fundamento');
  await expectSaved(page);
  // Hard navigation exercises recovery instead of merely reusing the singleton.
  await page.goto('/?q=art%C3%ADculo+47&scope=laboral&law=LFT');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Usar en Ingeniería Jurídica' }).first().click();
  await expect(title(page)).toHaveValue('Documento con fundamento');
  await expect(page.getByRole('region', { name: 'Notas al pie y apéndice de fundamentación legal' })).toContainText('Ley Federal del Trabajo');
  await expectSaved(page);
  await page.reload();
  await closeToasts(page);
  await expect(page.getByRole('region', { name: 'Notas al pie y apéndice de fundamentación legal' })).toContainText('Ley Federal del Trabajo');
  await page.getByText('Exportar', { exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Texto plano (.txt)', exact: true }).click();
  const file = await download;
  const path = info.outputPath('documento-con-fuentes.txt');
  await file.saveAs(path);
  const text = await readFile(path, 'utf8');
  expect(text).toContain('FUENTES Y FUNDAMENTOS');
  expect(text).toContain('Ley Federal del Trabajo');
  await capture(page, info, '02-cita-recuperada');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Fundamentador Jurídico Federal' })).toBeVisible();
});

test('eliminar el activo y Ctrl+S no lo recupera al recargar', async ({ page }, info) => {
  await openTemplate(page);
  await closeToasts(page);
  await title(page).fill('Borrador para eliminar');
  await expectSaved(page);
  const draftsBtn = page.getByTitle('Ver borradores locales');
  await draftsBtn.scrollIntoViewIfNeeded();
  await draftsBtn.click();
  const drafts = page.getByRole('dialog', { name: 'Borradores locales' });
  await drafts.getByRole('button', { name: 'Eliminar Borrador para eliminar' }).click();
  await expect(drafts).toContainText('Todavía no hay borradores');
  await capture(page, info, '03-borrador-eliminado');
  await drafts.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.keyboard.press('Control+s');
  await expect(title(page)).toHaveValue('Documento Jurídico sin Título');
  await page.reload();
  await closeToasts(page);
  await page.getByRole('button', { name: 'Cerrar catálogo' }).click();
  const draftsBtnAfter = page.getByTitle('Ver borradores locales');
  await draftsBtnAfter.scrollIntoViewIfNeeded();
  await draftsBtnAfter.click();
  await expect(page.getByRole('dialog', { name: 'Borradores locales' })).toContainText('Todavía no hay borradores');
});

test('variables generan una copia y el original conserva ediciones, con foco contenido', async ({ page }, info) => {
  await openTemplate(page);
  await closeToasts(page);
  await title(page).fill('Original editado');
  await editor(page).fill('MI EDICIÓN MANUAL DEBE CONSERVARSE');
  const varsBtn = page.getByRole('button', { name: 'Rellenar variables en lote' });
  await varsBtn.scrollIntoViewIfNeeded();
  await varsBtn.click();
  const variables = page.getByRole('dialog', { name: 'Variables de la plantilla' });
  await expect(variables).toContainText('borrador anterior conservará');
  const field = variables.getByRole('textbox').first();
  await field.fill('Persona de prueba');
  await capture(page, info, '04-variables');
  const last = variables.getByRole('button', { name: 'Generar copia con variables' });
  await last.focus();
  await page.keyboard.press('Tab');
  expect(await variables.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await last.click();
  await expect(title(page)).toHaveValue(/copia/);
  await expect(editor(page)).toContainText('Persona de prueba');
  await expectSaved(page);
  await page.reload();
  await closeToasts(page);
  const varsBtnAfter = page.getByRole('button', { name: 'Rellenar variables en lote' });
  await varsBtnAfter.scrollIntoViewIfNeeded();
  await varsBtnAfter.click();
  await expect(page.getByRole('dialog').getByRole('textbox').first()).toHaveValue('Persona de prueba');
  await page.keyboard.press('Escape');
  const draftsBtn = page.getByTitle('Ver borradores locales');
  await draftsBtn.scrollIntoViewIfNeeded();
  await draftsBtn.click();
  await page.getByRole('dialog').getByRole('button', { name: /^Original editado/ }).click();
  await expect(editor(page)).toContainText('MI EDICIÓN MANUAL DEBE CONSERVARSE');
  await expect(title(page)).toHaveValue('Original editado');
  await capture(page, info, '05-original-conservado');
});

test('una segunda pestaña no sobrescribe al escritor activo y puede reintentar', async ({ page, context }, info) => {
  await openTemplate(page);
  await title(page).fill('Documento protegido');
  await expectSaved(page);
  const second = await context.newPage();
  await second.goto('/?tab=estudio');
  await expect(second.getByRole('alert')).toContainText('otra pestaña');
  await expect(title(second)).toBeDisabled();
  await capture(second, info, '06-segunda-pestana');
  await page.close();
  await second.getByRole('button', { name: 'Reintentar' }).click();
  await expect(title(second)).toBeEnabled();
  await expect(title(second)).toHaveValue('Documento protegido');
});

test('DOCX importado conserva la edición tras recargar y no exporta párrafos eliminados', async ({ page }, info) => {
  await openTemplate(page);
  await closeToasts(page);
  const source = await Packer.toBuffer(new Document({ sections: [{ children: [
    new Paragraph(''), new Paragraph('CONSERVAR'), new Paragraph(''), new Paragraph('ELIMINADO'),
  ] }] }));
  await page.locator('input[type=file]').setInputFiles({ name: 'contrato.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: source });
  await expect(editor(page)).toContainText('ELIMINADO');
  await editor(page).fill('CONSERVAR EDITADO');
  await expectSaved(page);
  await page.reload();
  await expect(editor(page)).toContainText('CONSERVAR EDITADO');
  await page.getByText('Exportar', { exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Copia Word (.docx)', exact: true }).click();
  const output = info.outputPath('contrato-editado.docx');
  await (await downloaded).saveAs(output);
  const zip = await JSZip.loadAsync(await readFile(output));
  const xml = await zip.file('word/document.xml')!.async('string');
  expect(xml).toContain('CONSERVAR EDITADO');
  expect(xml).not.toContain('ELIMINADO');
  const original = await JSZip.loadAsync(source);
  expect(await zip.file('word/styles.xml')!.async('string')).toBe(await original.file('word/styles.xml')!.async('string'));
});

test('el worker PDF precargado permite la primera importación sin conexión', async ({ page, context }) => {
  await openTemplate(page);
  await closeToasts(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const pdf = new jsPDF();
  pdf.text('DOCUMENTO PDF DE PRUEBA', 20, 20);
  await context.setOffline(true);
  await page.locator('input[type=file]').setInputFiles({ name: 'prueba.pdf', mimeType: 'application/pdf',
    buffer: Buffer.from(pdf.output('arraybuffer')) });
  await expect(editor(page)).toContainText('DOCUMENTO PDF DE PRUEBA');
  await expectSaved(page);
});
