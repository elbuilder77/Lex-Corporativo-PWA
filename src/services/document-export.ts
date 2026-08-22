import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    return await file.text();
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (extension === 'pdf') {
    // Para PDF en browser, un lector rápido de cadenas o texto plano
    try {
      const text = await file.text();
      // Si el PDF contiene texto no comprimido legible:
      const clean = text.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, ' ').replace(/\s+/g, ' ');
      if (clean.length > 100) return clean;
    } catch {
      // fallback
    }
    return `[Archivo PDF cargado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`;
  }

  return await file.text();
}

export function exportDocumentToPDF(title: string, content: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header formal
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('LEX CORPORATIVO — ESTACIÓN JURÍDICA', margin, 15);
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.5);
  doc.line(margin, 17, pageWidth - margin, 17);

  // Título del documento
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const cleanTitle = title.toUpperCase();
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  let cursorY = 28;
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 4;

  // Cuerpo del documento
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const cleanContent = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');

  const paragraphs = cleanContent.split('\n\n');

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const lines = doc.splitTextToSize(para.trim(), contentWidth);

    if (cursorY + lines.length * 5.5 > pageHeight - 20) {
      doc.addPage();
      cursorY = 25;
    }

    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 5.5 + 4;
  }

  // Número de páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  doc.save(`${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

export async function exportDocumentToDocx(title: string, content: string): Promise<void> {
  const paragraphs = content.split('\n\n').map((p) => {
    const isHeading = p.startsWith('# ') || p.startsWith('## ');
    const text = p.replace(/^#+\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');

    return new Paragraph({
      text,
      heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
      alignment: isHeading ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { after: 200, line: 360 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
