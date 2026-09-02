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

const safeTitle = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Documento importado';

function docxParagraphs(xml: string): string[] {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  return Array.from(document.getElementsByTagNameNS('*', 'p'))
    .map((paragraph) =>
      Array.from(paragraph.getElementsByTagNameNS('*', 't'))
        .map((node) => node.textContent ?? '')
        .join(''),
    )
    .filter((paragraph) => paragraph.trim().length > 0);
}

async function importDocx(file: File): Promise<ImportedDocumentContent> {
  const sourceBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(sourceBuffer);
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('El DOCX no contiene un documento editable compatible.');
  const text = docxParagraphs(await documentFile.async('string')).join('\n\n');
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
  const sourceBuffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: sourceBuffer.slice(0) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    );
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
}

export async function importUserDocument(file: File): Promise<ImportedDocumentContent> {
  const extension = file.name.split('.').pop()?.toLocaleLowerCase('es-MX');
  if (extension === 'docx') return importDocx(file);
  if (extension === 'pdf') return importPdf(file);
  if (extension === 'txt' || file.type.startsWith('text/')) {
    return {
      title: safeTitle(file.name),
      text: await file.text(),
      sourceKind: 'txt',
      sourceFileName: file.name,
      sourceMimeType: file.type || 'text/plain',
    };
  }
  throw new Error('Formato no compatible. Importa un archivo DOCX, TXT o PDF.');
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
  const zip = await JSZip.loadAsync(sourceBuffer.slice(0));
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('No se pudo abrir la copia DOCX.');
  const xml = await documentFile.async('string');
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const paragraphs = Array.from(parsed.getElementsByTagNameNS('*', 'p'));
  const editedParagraphs = editedText.split(/\n{2,}|\n/).map((value) => value.trim()).filter(Boolean);

  paragraphs.forEach((paragraph, index) => {
    const textNodes = Array.from(paragraph.getElementsByTagNameNS('*', 't'));
    if (index >= editedParagraphs.length || textNodes.length === 0) return;
    textNodes[0].textContent = editedParagraphs[index];
    textNodes.slice(1).forEach((node) => { node.textContent = ''; });
  });

  const body = parsed.getElementsByTagNameNS('*', 'body')[0];
  const sectionProperties = body?.getElementsByTagNameNS('*', 'sectPr')[0];
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
  zip.file('word/document.xml', serialized || escapeXml(xml));
  download(await zip.generateAsync({ type: 'blob' }), fileName.replace(/\.docx$/i, '') + '-editado.docx');
}

export function downloadTextCopy(text: string, fileName: string): void {
  download(new Blob([text], { type: 'text/plain;charset=utf-8' }), fileName.replace(/\.[^.]+$/, '') + '-editado.txt');
}
