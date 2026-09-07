/** Shared by the registry and build-time precompiler: preserve the source text. */
export const normalizeTemplateSource = (source: string) => source.replace(/\r\n?/g, '\n');

export const templateFieldId = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export function convertMarkdownTemplate(source: string): string {
  return source.replace(/\[([^\]\n]{2,90})\]/g, (_match, token: string) => `{{${templateFieldId(token)}}}`);
}
