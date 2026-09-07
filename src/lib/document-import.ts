import JSZip from 'jszip';
import type { LegalCitation } from '../types';

export interface ImportedDocumentContent {
  title: string;
  text: string;
  sourceKind: 'docx' | 'txt' | 'pdf';
  sourceFileName: string;
  sourceMimeType: string;
  sourceBuffer?: ArrayBuffer;
}

export const DOCUMENT_IMPORT_LIMITS = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxDocxZipEntries: 250,
  maxDocxUncompressedXmlBytes: 15 * 1024 * 1024, // 15 MB
  maxDocxExpansionRatio: 100,
  maxPdfPages: 150,
  maxTextCharacters: 1_000_000,
} as const;

const safeTitle = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Documento importado';

function editableParagraphs(document: XMLDocument): Element[] {
  // Match exactly the text-bearing paragraphs presented by the importer. Empty
  // layout paragraphs must not consume an edited paragraph during export.
  return Array.from(document.getElementsByTagNameNS('*', 'p')).filter((paragraph) =>
    Array.from(paragraph.getElementsByTagNameNS('*', 't'))
      .some((node) => (node.textContent ?? '').trim().length > 0),
  );
}

function docxParagraphs(xml: string): string[] {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  return editableParagraphs(document)
    .map((paragraph) =>
      Array.from(paragraph.getElementsByTagNameNS('*', 't'))
        .map((node) => node.textContent ?? '')
        .join(''),
    )
    .filter((paragraph) => paragraph.trim().length > 0);
}

async function importDocx(file: File): Promise<ImportedDocumentContent> {
  if (file.size > DOCUMENT_IMPORT_LIMITS.maxFileSizeBytes) {
    throw new Error('El archivo DOCX excede el límite máximo permitido de 10 MB.');
  }
  const sourceBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(sourceBuffer);
  const entryNames = Object.keys(zip.files);
  if (entryNames.length > DOCUMENT_IMPORT_LIMITS.maxDocxZipEntries) {
    throw new Error('El archivo DOCX contiene una estructura no admitida o demasiadas entradas.');
  }

  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('El DOCX no contiene un documento editable compatible.');

  const xml = await documentFile.async('string');
  if (xml.length > DOCUMENT_IMPORT_LIMITS.maxDocxUncompressedXmlBytes) {
    throw new Error('El contenido del documento DOCX excede el tamaño máximo procesable.');
  }
  if (file.size > 0 && xml.length / file.size > DOCUMENT_IMPORT_LIMITS.maxDocxExpansionRatio) {
    throw new Error('El archivo DOCX excede el ratio de expansión seguro.');
  }

  const text = docxParagraphs(xml).join('\n\n');
  if (text.length > DOCUMENT_IMPORT_LIMITS.maxTextCharacters) {
    throw new Error('El texto extraído del DOCX excede el límite procesable.');
  }

  return {
    title: safeTitle(file.name),
    text,
    sourceKind: 'docx',
    sourceFileName: file.name,
    sourceMimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sourceBuffer,
  };
}

async function importPdf(file: File): Promise<ImportedDocumentContent> {
  if (file.size > DOCUMENT_IMPORT_LIMITS.maxFileSizeBytes) {
    throw new Error('El archivo PDF excede el límite máximo permitido de 10 MB.');
  }
  const sourceBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

  const loadingTask = pdfjs.getDocument({ data: sourceBuffer.slice(0) });
  try {
    const pdf = await loadingTask.promise;
    if (pdf.numPages > DOCUMENT_IMPORT_LIMITS.maxPdfPages) {
      throw new Error(`El PDF contiene ${pdf.numPages} páginas, superando el límite de ${DOCUMENT_IMPORT_LIMITS.maxPdfPages} páginas.`);
    }
    const pages: string[] = [];
    let totalChars = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      pages.push(pageText);
      totalChars += pageText.length;
      if (totalChars > DOCUMENT_IMPORT_LIMITS.maxTextCharacters) {
        throw new Error('El texto extraído del PDF excede el límite procesable.');
      }
    }
    const text = pages.filter(Boolean).join('\n\n');
    if (!text) throw new Error('El PDF no contiene texto seleccionable. La versión actual no incorpora OCR.');
    return {
      title: safeTitle(file.name),
      text,
      sourceKind: 'pdf',
      sourceFileName: file.name,
      sourceMimeType: file.type || 'application/pdf',
    };
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      /* noop */
    }
  }
}

export async function importUserDocument(file: File): Promise<ImportedDocumentContent> {
  if (file.size > DOCUMENT_IMPORT_LIMITS.maxFileSizeBytes) {
    throw new Error('El archivo excede el tamaño máximo permitido de 10 MB.');
  }
  const extension = file.name.split('.').pop()?.toLocaleLowerCase('es-MX');
  if (extension === 'docx') return importDocx(file);
  if (extension === 'pdf') return importPdf(file);
  if (extension === 'txt' || file.type.startsWith('text/')) {
    const text = await file.text();
    if (text.length > DOCUMENT_IMPORT_LIMITS.maxTextCharacters) {
      throw new Error('El texto del archivo excede el límite procesable.');
    }
    return {
      title: safeTitle(file.name),
      text,
      sourceKind: 'txt',
      sourceFileName: file.name,
      sourceMimeType: file.type || 'text/plain',
    };
  }
  throw new Error('Formato no compatible. Importa un archivo DOCX, TXT o PDF.');
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function exportPreservedDocxCopy(
  sourceBuffer: ArrayBuffer,
  editedText: string,
  citations: LegalCitation[],
  fileName: string,
): Promise<void> {
  if (sourceBuffer.byteLength > DOCUMENT_IMPORT_LIMITS.maxFileSizeBytes) {
    throw new Error('El archivo DOCX original excede el tamaño máximo seguro para exportación.');
  }
  const zip = await JSZip.loadAsync(sourceBuffer.slice(0));
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('No se pudo abrir la copia DOCX.');
  const xml = await documentFile.async('string');
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const paragraphs = editableParagraphs(parsed);
  const editedParagraphs = editedText.split(/\n{2,}|\n/).map((value) => value.trim()).filter(Boolean);

  paragraphs.forEach((paragraph, index) => {
    const textNodes = Array.from(paragraph.getElementsByTagNameNS('*', 't'));
    // Clear removed text as well. Keep the paragraph container, formatting and
    // non-text content intact (table cells must retain their paragraph).
    textNodes[0].textContent = editedParagraphs[index] ?? '';
    textNodes[0].setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    textNodes.slice(1).forEach((node) => { node.textContent = ''; });
  });

  const body = parsed.getElementsByTagNameNS('*', 'body')[0];
  if (!body) throw new Error('El DOCX no contiene un cuerpo de documento compatible.');
  const sectionProperties = Array.from(body.children).find((node) => node.localName === 'sectPr');
  const namespace = body?.namespaceURI || 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const appendParagraph = (value: string) => {
    if (!body) return;
    const paragraph = parsed.createElementNS(namespace, 'w:p');
    const run = parsed.createElementNS(namespace, 'w:r');
    const text = parsed.createElementNS(namespace, 'w:t');
    text.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    text.textContent = value;
    run.appendChild(text);
    paragraph.appendChild(run);
    body.insertBefore(paragraph, sectionProperties ?? null);
  };

  editedParagraphs.slice(paragraphs.length).forEach(appendParagraph);
  if (citations.length) {
    appendParagraph('');
    appendParagraph('FUENTES Y FUNDAMENTOS');
    citations.forEach((citation, index) => {
      appendParagraph(`${index + 1}. ${citation.lawName}, ${citation.articleNumber}. ${citation.sourceUrl}`);
    });
  }

  const serialized = new XMLSerializer().serializeToString(parsed);
  zip.file('word/document.xml', serialized);
  download(await zip.generateAsync({ type: 'blob' }), fileName.replace(/\.docx$/i, '') + '-editado.docx');
}

export function downloadTextCopy(text: string, fileName: string): void {
  download(new Blob([text], { type: 'text/plain;charset=utf-8' }), fileName.replace(/\.[^.]+$/, '') + '-editado.txt');
}
