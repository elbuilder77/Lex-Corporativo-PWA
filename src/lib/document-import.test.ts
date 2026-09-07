import { afterEach, describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import { exportPreservedDocxCopy, importUserDocument } from './document-import';

afterEach(() => vi.restoreAllMocks());

async function roundTripDocx(paragraphs: string, editedText: string) {
  const zip = new JSZip();
  zip.file('word/document.xml', `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
  zip.file('word/styles.xml', '<styles>preservar</styles>');
  const original = await zip.generateAsync({ type: 'arraybuffer' });
  let exported: Blob | undefined;
  const originalCreate = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
  const originalRevoke = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: (blob: Blob) => { exported = blob; return 'blob:test'; } });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => {} });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    await exportPreservedDocxCopy(original, editedText, [], 'contrato.docx');
    const result = await JSZip.loadAsync(await exported!.arrayBuffer());
    const xml = await result.file('word/document.xml')!.async('string');
    const reimported = await importUserDocument(new File([await exported!.arrayBuffer()], 'copia.docx'));
    return { xml, text: reimported.text, styles: await result.file('word/styles.xml')!.async('string'), original, zip };
  } finally {
    if (originalCreate) Object.defineProperty(URL, 'createObjectURL', originalCreate);
    else Reflect.deleteProperty(URL, 'createObjectURL');
    if (originalRevoke) Object.defineProperty(URL, 'revokeObjectURL', originalRevoke);
    else Reflect.deleteProperty(URL, 'revokeObjectURL');
  }
}
const paragraph = (text: string) => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;

describe('Document Import Utility', () => {
  it('importa archivos de texto plano (.txt) correctamente', async () => {
    const textContent = 'CONTRATO DE ARRENDAMIENTO\n\nCláusula primera...';
    const file = new File([textContent], 'contrato_arrendamiento.txt', { type: 'text/plain' });

    const result = await importUserDocument(file);
    expect(result.sourceKind).toBe('txt');
    expect(result.title).toBe('contrato_arrendamiento');
    expect(result.text).toBe(textContent);
    expect(result.sourceFileName).toBe('contrato_arrendamiento.txt');
  });

  it('rechaza formatos de archivo no compatibles', async () => {
    const file = new File(['fake data'], 'archivo.xyz', { type: 'application/octet-stream' });
    await expect(importUserDocument(file)).rejects.toThrow(/Formato no compatible/i);
  });

  it('no recupera el texto eliminado al exportar una copia DOCX', async () => {
    const result = await roundTripDocx(paragraph('Conservar') + paragraph('ELIMINADO'), 'Conservar');
    expect(result.text).toBe('Conservar');
    expect(result.xml).not.toContain('ELIMINADO');
    expect(result.styles).toBe('<styles>preservar</styles>');
    expect(await (await JSZip.loadAsync(result.original)).file('word/document.xml')!.async('string')).toContain('ELIMINADO');
  });

  it('alinea importación y exportación aunque el original tenga párrafos vacíos', async () => {
    const result = await roundTripDocx('<w:p/>' + paragraph('Primero') + '<w:p/>' + paragraph('Segundo'), 'Editado primero\n\nEditado segundo\n\nAñadido');
    expect(result.text).toBe('Editado primero\n\nEditado segundo\n\nAñadido');
  });

  it('permite eliminar todo el texto de un DOCX sin recuperar el original', async () => {
    const result = await roundTripDocx(paragraph('ELIMINADO'), '');
    expect(result.text).toBe('');
    expect(result.xml).not.toContain('ELIMINADO');
  });
});
