import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function exportDocumentDocx(title: string, content: string, fileName?: string): Promise<void> {
  const rawLines = content.split(/\r?\n/);
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 26, // 13pt
          color: '0F172A',
          font: 'Calibri',
        }),
      ],
    })
  );

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [new TextRun({ text: '' })],
        })
      );
      continue;
    }

    const isHeading = /^(?:DECLARACIONES|CL[AÁ]USULAS|TRANSITORIOS|RESOLUCIONES|ORDEN DEL D[IÍ]A|PETICIONES|HECHOS|PRUEBAS|RESOLUTIVOS)(?:[\s.:-]|$)/i.test(trimmed);
    const isClause = /^(?:CL[AÁ]USULA\s+[A-ZÁÉÍÓÚÑ-]+|PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[EÉ]PTIMA|OCTAVA|NOVENA|D[EÉ]CIMA|VIG[EÉ]SIMA|TRIG[EÉ]SIMA|I|II|III|IV|V|VI|VII|VIII|IX|X)[.:-]/i.test(trimmed);
    const isSignature = /^(?:POR LA PARTE|POR EL |EL TRABAJADOR|EL SUSCRIPTOR|AVAL|PRESIDENTE|SECRETARIO|COMISARIO|REPRESENTANTE|Firma:)/i.test(trimmed);

    if (isHeading) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 280, after: 180 },
          children: [
            new TextRun({
              text: trimmed.toUpperCase(),
              bold: true,
              size: 24, // 12pt
              color: '0F172A',
              font: 'Calibri',
            }),
          ],
        })
      );
    } else if (isClause || isSignature) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { before: 140, after: 100, line: 276 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 22, // 11pt
              color: '1E293B',
              font: 'Calibri',
            }),
          ],
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { before: 60, after: 60, line: 276 },
          children: [
            new TextRun({
              text: trimmed,
              size: 22, // 11pt
              color: '334155',
              font: 'Calibri',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const finalName = fileName || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
