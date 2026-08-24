# Lex Corporativo PWA — Consulta Jurídica y Licitaciones Abiertas

PWA gratuita para consultar legislación federal mexicana y procedimientos de contratación pública (licitaciones abiertas de CompraNet). El producto está enfocado en búsqueda rápida, verificable y limpia; no recopila historial ni requiere registro, licencia ni clave de API.

La aplicación ofrece dos servicios de consulta independientes y limpios:
1. **Buscador Normativo Federal**: Consulta de leyes y reglamentos federales con motor SQLite WASM local y enlace directo a la Cámara de Diputados.
2. **Buscador de Licitaciones Abiertas en México**: Consulta de procedimientos de contratación pública vigentes en CompraNet (IMSS, CFE, PEMEX, SICT, SAT, etc.), con cronogramas, plazos de cierre, presupuesto estimado, fundamento en LAASSP/LOPSRM y enlace oficial al expediente.

## Alcance del producto

- **Legislación Federal**: 5,011 disposiciones en 13 leyes y reglamentos federales en materias laboral, mercantil, fiscal, aduanal y comercio exterior.
- **Licitaciones Públicas**: Procedimientos abiertos clasificados por materia (adquisiciones, servicios, obra pública, arrendamientos), carácter (nacional, TLC, abierta) y entidad federativa.
- **Portafolio de Guardados**: Almacenamiento local de artículos legales favoritos y licitaciones en seguimiento para monitoreo de plazos de cierre.
- **Privacidad y Limpieza**: Cero recopilación de historial de búsqueda o consultas frecuentes; los guardados residen exclusivamente en el dispositivo del usuario.
- **PWA Offline**: Instalación como aplicación web progresiva y funcionamiento offline con Service Worker precacheado.

## Corpus y Fuentes

| Módulo | Fuente Oficial | Cobertura |
| --- | --- | --- |
| Legislación Federal | Cámara de Diputados | LFT, CCom, LGSM, LGTOC, CFF, LISR, LIVA, RLISR, RLIVA, LA, RLA, LCE, RLCE |
| Licitaciones Abiertas | CompraNet / Plataforma Digital Nacional / Datos Abiertos | Procedimientos vigentes federales y estatales (LAASSP / LOPSRM) |

## Desarrollo

Requisitos: Node.js 22+ y npm.

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

## Arquitectura

- **Frontend**: React 19, TypeScript, Vite y Tailwind CSS.
- **Motor de Legislación**: `sql.js` (SQLite en WebAssembly) para consultas normativas locales ultrarrápidas.
- **Motor de Licitaciones**: Búsqueda indexada por tokens y filtros facetados en tiempo real.
- **Estado**: Zustand para artículos guardados, licitaciones en seguimiento y notificaciones.
- **PWA & Caché**: `vite-plugin-pwa` y Workbox con precaché de corpus, catálogo de licitaciones y binarios WASM.
