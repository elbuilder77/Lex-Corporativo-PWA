import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import Handlebars from 'handlebars';
import { describe, expect, it } from 'vitest';
import { precompileLegalTemplates } from '../../scripts/template-precompiler';
import { PWA_LEGAL_TEMPLATES } from './pwa-constants';
import { hasTemplateRenderer, renderLegalTemplate } from './template-renderer';
import { convertMarkdownTemplate, normalizeTemplateSource } from './template-source';

const require = createRequire(import.meta.url);

describe('CSP-compatible legal template rendering', () => {
  it('renders every embedded and public source identically to Handlebars with string code generation disabled', () => {
    const context = vm.createContext({}, { codeGeneration: { strings: false, wasm: false } });
    vm.runInContext('globalThis.self = globalThis', context);
    vm.runInContext(readFileSync(require.resolve('handlebars/dist/handlebars.runtime.js'), 'utf8'), context);
    const generated = precompileLegalTemplates(process.cwd())
      .replace("import Handlebars from 'handlebars/runtime';", '')
      .replace('export const renderers', 'globalThis.renderers');
    vm.runInContext(generated, context);
    const renderers: Map<string, (data: Record<string, unknown>) => string> = context.renderers;
    expect(renderers.size).toBe(PWA_LEGAL_TEMPLATES.length + 13);

    for (const [source, render] of renderers) {
      const values = Object.fromEntries([...source.matchAll(/{{{?\s*([\w]+)\s*}?}}/g)]
        .map((match) => [match[1], `José & María <${match[1]}>`]));
      expect(render(values)).toBe(Handlebars.compile(source)(values));
      expect(render({})).toBe(Handlebars.compile(source)({}));
      expect(renderLegalTemplate(source, values)).toBe(render(values));
    }
    // Control: the previous runtime compiler really fails in this same environment.
    const previousContext = vm.createContext({}, { codeGeneration: { strings: false, wasm: false } });
    vm.runInContext('globalThis.self = globalThis', previousContext);
    vm.runInContext(readFileSync(require.resolve('handlebars/dist/handlebars.js'), 'utf8'), previousContext);
    previousContext.source = PWA_LEGAL_TEMPLATES[0].templateHandlebars;
    expect(() => vm.runInContext('Handlebars.compile(source)({})', previousContext)).toThrow(/Code generation from strings disallowed/);
  });

  it('renders the public pagaré and markdown source, with Windows and Unix line endings', () => {
    const pagare = readFileSync('public/plantillas/pagare_mercantil.hbs', 'utf8');
    expect(renderLegalTemplate(pagare, { nombre_acreedor: 'Ana López', monto_numero: '1500' }))
      .toContain('pagar a la orden de Ana López');
    const markdown = convertMarkdownTemplate(readFileSync('public/plantillas/CONTRATO DE COMPRAVENTA MERCANTIL.md', 'utf8'));
    expect(hasTemplateRenderer(markdown)).toBe(true);
    const normalized = normalizeTemplateSource(markdown);
    expect(renderLegalTemplate(normalized.replace(/\n/g, '\r\n'), {})).toBe(renderLegalTemplate(normalized, {}));
  });

  it('fails explicitly for an unknown source instead of compiling it in the browser', () => {
    expect(hasTemplateRenderer('Unknown {{name}}')).toBe(false);
    expect(() => renderLegalTemplate('Unknown {{name}}', {})).toThrow('no está incluida');
  });
});
