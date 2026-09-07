import { jsPDF } from 'jspdf';

let cachedLogoDataUri: string | null = null;

async function getLogoDataUri(): Promise<string | null> {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  if (typeof document === 'undefined') return null;

  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Logo no disponible'));
      img.src = '/logo.png';
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 120;
    canvas.height = img.naturalHeight || 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      cachedLogoDataUri = canvas.toDataURL('image/png');
      return cachedLogoDataUri;
    }
  } catch {
    // Fallback silencioso
  }
  return null;
}

function drawDiscreetHeader(doc: jsPDF, logoDataUri: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  if (logoDataUri) {
    try {
      doc.addImage(logoDataUri, 'PNG', margin, 8, 8, 8);
    } catch {
      // Ignorar si falla
    }
  }

  const textStartX = logoDataUri ? margin + 10 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('LEX CORPORATIVO', textStartX, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ESTACIÓN DE INGENIERÍA JURÍDICA', textStartX, 15.5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  doc.text(dateStr, pageWidth - margin, 13, { align: 'right' });

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, 18.5, pageWidth - margin, 18.5);
}

function drawDiscreetFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, 282, pageWidth - margin, 282);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento Jurídico Privado · Generado en Lex Corporativo PWA', margin, 287);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin, 287, { align: 'right' });
}

export async function exportDocumentPdf(title: string, content: string, fileName?: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const logoDataUri = await getLogoDataUri();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 28;

  drawDiscreetHeader(doc, logoDataUri);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);

  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;
  });

  currentY += 4;

  const rawLines = content.split(/\r?\n/);

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      currentY += 3.5;
      continue;
    }

    if (currentY > 270) {
      doc.addPage();
      drawDiscreetHeader(doc, logoDataUri);
      currentY = 28;
    }

    const isHeading = /^(?:DECLARACIONES|CL[AÁ]USULAS|TRANSITORIOS|RESOLUCIONES|ORDEN DEL D[IÍ]A|PETICIONES|HECHOS|PRUEBAS|RESOLUTIVOS)(?:[\s.:-]|$)/i.test(trimmed);
    const isClause = /^(?:CL[AÁ]USULA\s+[A-ZÁÉÍÓÚÑ-]+|PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[EÉ]PTIMA|OCTAVA|NOVENA|D[EÉ]CIMA|VIG[EÉ]SIMA|TRIG[EÉ]SIMA|I|II|III|IV|V|VI|VII|VIII|IX|X)[.:-]/i.test(trimmed);
    const isSignature = /^(?:POR LA PARTE|POR EL |EL TRABAJADOR|EL SUSCRIPTOR|AVAL|PRESIDENTE|SECRETARIO|COMISARIO|REPRESENTANTE)/i.test(trimmed);

    if (isHeading) {
      if (currentY > 255) {
        doc.addPage();
        drawDiscreetHeader(doc, logoDataUri);
        currentY = 28;
      }
      currentY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(trimmed.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
      continue;
    }

    if (isClause || isSignature) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
    }

    const wrapped = doc.splitTextToSize(trimmed, contentWidth);
    wrapped.forEach((wLine: string) => {
      if (currentY > 272) {
        doc.addPage();
        drawDiscreetHeader(doc, logoDataUri);
        currentY = 28;
      }
      doc.text(wLine, margin, currentY);
      currentY += 4.8;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawDiscreetFooter(doc, p, totalPages);
  }

  const finalName = fileName || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.pdf`;
  doc.save(finalName);
}
