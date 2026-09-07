import { PWA_LEGAL_TEMPLATES } from './pwa-constants';
import type { FormFieldDefinition, LegalTemplate } from '../types';
import { hasTemplateRenderer } from './template-renderer';
import { convertMarkdownTemplate, templateFieldId as fieldId } from './template-source';

interface PublicTemplateEntry {
  id: string;
  file: string;
  format: 'md' | 'hbs';
}

const humanize = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .toLocaleLowerCase('es-MX')
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-MX'));

function variablesFrom(source: string, format: PublicTemplateEntry['format']): string[] {
  const matches = format === 'md'
    ? [...source.matchAll(/\[([^\]\n]{2,90})\]/g)].map((match) => match[1])
    : [...source.matchAll(/{{{?\s*([a-zA-Z0-9_]+)\s*}?}}/g)].map((match) => match[1]);
  return [...new Set(matches)].filter((name) => !name.startsWith('#') && name !== 'else');
}

function fieldsFor(source: string, format: PublicTemplateEntry['format'], base: LegalTemplate): FormFieldDefinition[] {
  const known = new Map(base.fields.map((field) => [field.id, field]));
  return variablesFrom(source, format).map((token) => {
    const id = format === 'md' ? fieldId(token) : token;
    return known.get(id) ?? {
      id,
      label: humanize(token),
      type: /descripcion|antecedente|objeto|obligacion|clausula|domicilio|manifestacion|motivo|detalle/i.test(token)
        ? 'textarea'
        : 'text',
      required: true,
    };
  });
}

export async function loadTemplateRegistry(): Promise<LegalTemplate[]> {
  const baseById = new Map(PWA_LEGAL_TEMPLATES.map((template) => [template.id, template]));
  try {
    const manifestResponse = await fetch('/plantillas/index.json');
    if (!manifestResponse.ok) throw new Error('Manifest unavailable');
    const manifest = (await manifestResponse.json()) as PublicTemplateEntry[];
    await Promise.all(
      manifest.map(async (entry) => {
        const base = baseById.get(entry.id);
        if (!base) return;
        const response = await fetch(`/plantillas/${encodeURIComponent(entry.file)}`);
        if (!response.ok) return;
        const source = await response.text();
        const templateHandlebars = entry.format === 'md' ? convertMarkdownTemplate(source) : source;
        // A stale server/cache must not replace a usable embedded template with
        // a source that this release cannot render under its Content Security Policy.
        if (!hasTemplateRenderer(templateHandlebars)) return;
        baseById.set(entry.id, {
          ...base,
          fields: fieldsFor(source, entry.format, base),
          toggles: undefined,
          templateHandlebars,
        });
      }),
    );
  } catch {
    // El catálogo embebido mantiene el Estudio operativo sin conexión.
  }
  return PWA_LEGAL_TEMPLATES.map((template) => baseById.get(template.id) ?? template);
}
