import { describe, it, expect } from 'vitest';
import { importUserDocument } from './document-import';

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
});
