declare module 'virtual:legal-template-renderers' {
  export const renderers: Map<string, (data: Record<string, unknown>) => string>;
}
