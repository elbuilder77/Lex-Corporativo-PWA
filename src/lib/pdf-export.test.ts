import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportDocumentPdf } from './pdf-export';

describe('exportDocumentPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
    }
    if (typeof URL.revokeObjectURL === 'undefined') {
      URL.revokeObjectURL = vi.fn();
    }
  });

  it('genera un documento PDF sin lanzar excepciones para contenido estándar', async () => {
    const title = 'Contrato Individual de Trabajo';
    const content = `DECLARACIONES\n\nI. DECLARA EL PATRÓN:\nQue es una sociedad mercantil legalmente constituida.\n\nCLÁUSULAS\n\nPRIMERA.- PUESTO Y ACTIVIDADES.\nEl TRABAJADOR se obliga a prestar sus servicios como Especialista Jurídico.\n\nSEGUNDA.- JORNADA DE TRABAJO.\nLa jornada laboral será de 48 horas semanales.\n\nPOR EL PATRÓN\n_____________________\nREPRESENTANTE LEGAL\n\nEL TRABAJADOR\n_____________________\nJUAN PÉREZ`;

    await expect(exportDocumentPdf(title, content)).resolves.not.toThrow();
  });

  it('maneja caracteres especiales en español, comillas tipográficas y guiones largos', async () => {
    const title = 'Convenio de Confidencialidad (NDA)';
    const content = `CLÁUSULA PRIMERA.— INFORMACIÓN CONFIDENCIAL.\nLas partes convienen que el “RECEPTOR” mantendrá estricta confidencialidad sobre los secretos industriales, patentes y diseños, según el artículo 15° de la Ley de la Propiedad Industrial.\n\nViñetas:\n• Secreto comercial\n• Datos financieros\n• Clientes y proveedores`;

    await expect(exportDocumentPdf(title, content)).resolves.not.toThrow();
  });

  it('procesa correctamente documentos extensos con múltiples páginas y secciones legales', async () => {
    const title = 'Contrato de Prestación de Servicios Profesionales';
    const paragraphs: string[] = [
      'ANTECEDENTES',
      'I. Las partes manifiestan que cuentan con la capacidad jurídica y facultades necesarias para celebrar el presente instrumento.',
      'DECLARACIONES',
      'I. DECLARA "EL CLIENTE": Que es una persona moral legalmente constituida conforme a las leyes de los Estados Unidos Mexicanos.',
      'II. DECLARA "EL PRESTADOR": Que cuenta con la experiencia, personal y conocimientos técnicos indispensables.',
      'CLÁUSULAS',
    ];

    for (let i = 1; i <= 35; i++) {
      paragraphs.push(
        `CLÁUSULA ${i}.- OBLIGACIÓN CONTRACTUAL NÚMERO ${i}. Las partes acuerdan expresamente dar cabal cumplimiento a lo establecido en la presente estipulación contractual, sujetándose a la jurisdicción de los tribunales competentes en términos de ley.`,
      );
    }

    paragraphs.push(
      'FUENTES Y FUNDAMENTOS',
      '1. Código Civil Federal, Art. 1792. https://diputados.gob.mx/LeyesBiblio/pdf/CCF.pdf',
      'FIRMAS Y RATIFICACIÓN',
      'POR "EL CLIENTE"\n_____________________\nREPRESENTANTE LEGAL',
      'POR "EL PRESTADOR"\n_____________________\nDIRECTOR GENERAL',
    );

    const fullContent = paragraphs.join('\n\n');
    await expect(exportDocumentPdf(title, fullContent, 'test_contrato_extenso.pdf')).resolves.not.toThrow();
  });
});
