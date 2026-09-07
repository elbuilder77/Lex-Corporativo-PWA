import { renderers } from 'virtual:legal-template-renderers';
import { normalizeTemplateSource } from './template-source';

export const hasTemplateRenderer = (source: string): boolean => renderers.has(normalizeTemplateSource(source));

export function renderLegalTemplate(source: string, data: Record<string, unknown>): string {
  const render = renderers.get(normalizeTemplateSource(source));
  if (!render) throw new Error('Esta versión de la plantilla no está incluida en la aplicación. Recarga para actualizarla.');
  return render(data);
}
