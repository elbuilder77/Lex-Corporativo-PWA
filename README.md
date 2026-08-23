# Lex Corporativo — Buscador Jurídico Federal

PWA gratuita para consultar un corpus local de legislación federal mexicana. El producto está enfocado en búsqueda normativa rápida y verificable; no requiere licencia, cuenta ni clave de API.

La aplicación tiene un solo módulo: el buscador. Historial, favoritos, privacidad, fuentes y la referencia a Desktop se presentan como paneles auxiliares sin rutas ni navegación independiente.

## Alcance del producto

- Consulta gratuita de 5,011 disposiciones en 13 leyes y reglamentos federales.
- Búsqueda determinista en el dispositivo con SQLite WASM.
- Filtros por área jurídica y ordenamiento.
- Resultados con ley, artículo y enlace a la biblioteca oficial de la Cámara de Diputados.
- Historial y favoritos guardados en `localStorage` del navegador.
- Instalación PWA y funcionamiento offline después de cargar los recursos.
- Referencia discreta a Lex Corporativo Desktop dentro del panel informativo.

La aplicación no incorpora IA generativa, BYOK, licencias, autenticación, pagos, carga documental ni redacción asistida.

## Corpus incluido

| Área | Ordenamientos |
| --- | --- |
| Laboral | LFT |
| Mercantil | CCom, LGSM, LGTOC |
| Fiscal | CFF, LISR, LIVA, RLISR, RLIVA |
| Aduanal | LA, RLA |
| Comercio exterior | LCE, RLCE |

Los archivos del corpus están en `public/corpus/`. Los resultados enlazan a los índices oficiales de leyes o reglamentos para cotejar vigencia y reformas.

## Desarrollo

Requisitos: Node.js 22 y npm.

```bash
npm install
npm run dev
```

Validación local:

```bash
npm run lint
npm run test:run
npm run build
npm run preview
```

## Arquitectura breve

- React, TypeScript, Vite y Tailwind CSS.
- Una sola pantalla y ningún router de aplicación.
- `sql.js` para cargar y consultar el corpus dentro del navegador.
- Zustand para historial, favoritos y estado de interfaz.
- `vite-plugin-pwa` y Workbox para precachear aplicación, corpus y SQLite WASM.

## Nota de uso

El corpus local facilita la consulta. Antes de citar o tomar una decisión, debe cotejarse el texto, las reformas y la vigencia en la fuente oficial enlazada.
