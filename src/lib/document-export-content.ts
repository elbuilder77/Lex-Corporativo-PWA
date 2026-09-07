import type { LegalCitation } from '../types';

/** Include the sources visible outside the editor in every textual export. */
export function documentExportText(text: string, citations: LegalCitation[]): string {
  if (!citations.length) return text;
  const sources = citations.map((citation, index) =>
    `${index + 1}. ${citation.lawName}, ${citation.articleNumber}. ${citation.sourceUrl}`,
  );
  return `${text}\n\nFUENTES Y FUNDAMENTOS\n\n${sources.join('\n\n')}`;
}
