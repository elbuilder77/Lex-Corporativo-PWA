import { readFileSync } from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import ts from 'typescript';
import type { Plugin } from 'vite';
import { convertMarkdownTemplate, normalizeTemplateSource } from '../src/lib/template-source.ts';

const virtualId = 'virtual:legal-template-renderers';
const resolvedId = `\0${virtualId}`;

/** Only executable build tooling imports the compiler; browsers receive runtime functions. */
export function precompileLegalTemplates(root: string): string {
  const sources = new Set<string>();
  const constantsPath = path.join(root, 'src/lib/pwa-constants.ts');
  const constants = ts.createSourceFile(constantsPath, readFileSync(constantsPath, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(constants) === 'templateHandlebars') {
      if (!ts.isNoSubstitutionTemplateLiteral(node.initializer) && !ts.isStringLiteral(node.initializer)) {
        throw new Error('Legal templates must be static text for CSP-compatible precompilation.');
      }
      sources.add(normalizeTemplateSource(node.initializer.text));
    }
    ts.forEachChild(node, visit);
  }
  visit(constants);
  if (sources.size === 0) throw new Error('No embedded legal templates found.');

  const templateDir = path.join(root, 'public/plantillas');
  const manifest: Array<{ file: string; format: string }> = JSON.parse(readFileSync(path.join(templateDir, 'index.json'), 'utf8'));
  for (const entry of manifest) {
    const sourcePath = path.resolve(templateDir, entry.file);
    if (!sourcePath.startsWith(`${templateDir}${path.sep}`)) throw new Error('Template file must be within public/plantillas.');
    const source = readFileSync(sourcePath, 'utf8');
    if (entry.format !== 'md' && entry.format !== 'hbs') throw new Error(`Unknown template format: ${entry.format}`);
    sources.add(normalizeTemplateSource(entry.format === 'md' ? convertMarkdownTemplate(source) : source));
  }
  const entries = [...sources].map((source) =>
    `[${JSON.stringify(source)}, Handlebars.template(${Handlebars.precompile(source)})]`,
  );
  return `import Handlebars from 'handlebars/runtime';\nexport const renderers = new Map([\n${entries.join(',\n')}\n]);\n`;
}

export function legalTemplatePrecompiler(): Plugin {
  let root: string;
  return {
    name: 'legal-template-precompiler',
    configResolved(config) { root = config.root; },
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) {
      if (id !== resolvedId) return;
      this.addWatchFile(path.join(root, 'src/lib/pwa-constants.ts'));
      this.addWatchFile(path.join(root, 'public/plantillas'));
      return precompileLegalTemplates(root);
    },
    handleHotUpdate(ctx) {
      if (ctx.file === path.join(root, 'src/lib/pwa-constants.ts') || ctx.file.startsWith(path.join(root, 'public/plantillas') + path.sep)) {
        const module = ctx.server.moduleGraph.getModuleById(resolvedId);
        if (module) {
          ctx.server.moduleGraph.invalidateModule(module);
          ctx.server.ws.send({ type: 'full-reload' });
        }
      }
    },
  };
}
