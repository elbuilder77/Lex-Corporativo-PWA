import { jsPDF } from 'jspdf';
import logoMarkUrl from '../assets/logo-mark.png';

let cachedLogoDataUri: string | null = null;

async function getLogoDataUri(): Promise<string | null> {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Image === 'undefined') {
    return null;
  }

  try {
    const dataUri = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timer = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Logo timeout'));
      }, 400);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 100;
          canvas.height = img.naturalHeight || 100;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch {
          // Canvas conversion fallback
        }
        reject(new Error('Canvas error'));
      };

      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Image load failed'));
      };

      img.src = logoMarkUrl;
    });

    cachedLogoDataUri = dataUri;
    return dataUri;
  } catch {
    return null;
  }
}

function drawDiscreetHeader(doc: jsPDF, logoDataUri: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  if (logoDataUri) {
    try {
      doc.addImage(logoDataUri, 'PNG', margin, 8, 8, 8);
    } catch {
      // Fallback silencioso
    }
  }

  const textStartX = logoDataUri ? margin + 10 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('LEX CORPORATIVO', textStartX, 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ESTACIÓN DE INGENIERÍA JURÍDICA', textStartX, 15);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  doc.text(dateStr, pageWidth - margin, 13, { align: 'right' });

  // Doble línea institucional: dorado legal + filete sutil
  doc.setDrawColor(197, 160, 89); // #C5A059 legal-gold
  doc.setLineWidth(0.5);
  doc.line(margin, 17.5, pageWidth - margin, 17.5);

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
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

  // Título principal centrado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);

  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;
  });

  currentY += 4;

  // Normalización de saltos y espacios
  const cleanContent = content.replace(/\u00A0/g, ' ').replace(/\u200B/g, '');
  const rawLines = cleanContent.split(/\r?\n/);

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

    // Encabezados de sección estructurales
    const isHeading = /^(?:DECLARACIONES|CL[AÁ]USULAS|TRANSITORIOS|RESOLUCIONES|ORDEN DEL D[IÍ]A|PETICIONES|HECHOS|PRUEBAS|RESOLUTIVOS|ANTECEDENTES|EXPONEN|ACUERDOS|CONVOCATORIA|CAP[IÍ]TULO|FUENTES Y FUNDAMENTOS)(?:[\s.:-]|$)/i.test(trimmed);
    const isSignature = /^(?:POR LA PARTE|POR EL |EL TRABAJADOR|EL SUSCRIPTOR|AVAL|PRESIDENTE|SECRETARIO|COMISARIO|REPRESENTANTE|TESTIGO|FIRMA|FIRMAS)(?:[\s.:-]|$)/i.test(trimmed);

    if (isHeading) {
      if (currentY > 240) {
        doc.addPage();
        drawDiscreetHeader(doc, logoDataUri);
        currentY = 28;
      }
      currentY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(trimmed.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
      currentY += 6.5;
      continue;
    }

    // Prevención de salto de página que corte bloques de firmas
    if (isSignature && currentY > 235) {
      doc.addPage();
      drawDiscreetHeader(doc, logoDataUri);
      currentY = 28;
    }

    // Detección de encabezado de cláusula con separación de título y cuerpo
    const clauseMatch = trimmed.match(
      /^((?:CL[AÁ]USULA\s+[A-ZÁÉÍÓÚÑ0-9ªº-]+|(?:D[EÉ]CIM[AO]|VIG[EÉ]SIM[AO]|TRIG[EÉ]SIM[AO])?\s*(?:PRIMER[AO]|SEGUND[AO]|TERCER[AO]|CUART[AO]|QUINT[AO]|SEXT[AO]|S[EÉ]PTIM[AO]|OCTAV[AO]|NOVEN[AO]|D[EÉ]CIM[AO])|[0-9]+[ªº.]?|[IVXLCDM]+)[.:\-—]+(?:\s+[^.:\n]+[.:\-—]+)?)\s*(.*)$/i
    );

    if (clauseMatch) {
      const clauseTitle = clauseMatch[1].trim();
      const clauseBody = clauseMatch[2]?.trim() || '';

      if (currentY > 255) {
        doc.addPage();
        drawDiscreetHeader(doc, logoDataUri);
        currentY = 28;
      }

      // Título de la cláusula en negrita
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const wrappedTitle = doc.splitTextToSize(clauseTitle, contentWidth);
      wrappedTitle.forEach((tLine: string) => {
        if (currentY > 272) {
          doc.addPage();
          drawDiscreetHeader(doc, logoDataUri);
          currentY = 28;
        }
        doc.text(tLine, margin, currentY);
        currentY += 4.8;
      });

      // Cuerpo de la cláusula en peso normal
      if (clauseBody) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const wrappedBody = doc.splitTextToSize(clauseBody, contentWidth);
        wrappedBody.forEach((bLine: string) => {
          if (currentY > 272) {
            doc.addPage();
            drawDiscreetHeader(doc, logoDataUri);
            currentY = 28;
          }
          doc.text(bLine, margin, currentY);
          currentY += 4.8;
        });
      }
      continue;
    }

    // Líneas de firma o texto estándar
    if (isSignature) {
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

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    doc.save(finalName);
  }
}
