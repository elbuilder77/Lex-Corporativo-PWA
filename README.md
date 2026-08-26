# Lex Corporativo PWA — Consulta Jurídica y Licitaciones Abiertas

PWA gratuita para consultar legislación federal mexicana y procedimientos de contratación pública (licitaciones abiertas de CompraNet). El producto está enfocado en búsqueda rápida, verificable y limpia; no requiere registro, licencia ni clave de API.

La plataforma web ofrece dos servicios de consulta independientes:
1. **Buscador Normativo Federal**: Consulta de leyes y reglamentos federales con motor SQLite WASM en sesión y enlaces directos a la Cámara de Diputados.
2. **Radar de Licitaciones Abiertas en México**: Consulta de procedimientos de contratación pública vigentes en CompraNet (IMSS, CFE, PEMEX, SICT, SAT, etc.), con cronogramas, plazos de cierre, presupuesto estimado, fundamento en LAASSP/LOPSRM y enlace oficial al expediente.

## Alcance del producto

- **Legislación Federal**: 5,011 disposiciones en 13 leyes y reglamentos federales en materias laboral, mercantil, fiscal, aduanal y comercio exterior.
- **Licitaciones Públicas**: Procedimientos abiertos clasificados por materia (adquisiciones, servicios, obra pública, arrendamientos), carácter (nacional, internacional, abierta) y entidad federativa.
- **Cobertura y Fuentes**: Transparencia entre fuentes ya consultables y conectores estatales (Yucatán activo con datos parciales; Nuevo León, Jalisco y CDMX priorizados).
- **Privacidad y Medición**: Sin almacenamiento de consultas ni rastreo confidencial; métricas web agregadas con Vercel Analytics y Speed Insights.
- **PWA Ligera**: Instalación como aplicación web progresiva con precaché ligero del shell de la aplicación (sin precargar 7 MiB de corpus/WASM).

## Diferenciación Arquitectónica: PWA vs. Desktop

| Característica | PWA (Web / Móvil) | Desktop (Windows x64) |
| --- | --- | --- |
| **Propósito** | Herramienta gratuita y ágil de consulta y embudo | Estación de trabajo profesional de alta densidad |
| **Operación Offline** | En línea requerida (SQLite WASM en sesión) | 100% Offline autónomo (LanceDB + ONNX Runtime) |
| **Corpus Integrado** | 13 leyes y reglamentos (5,011 disposiciones) | 16 ordenamientos completos (7,348 fragmentos RAG) |
| **Auditoría Contractual** | N/A | Auditoría de riesgos en 5 materias con semáforos |
| **Redacción Jurídica** | N/A | Asistente de redacción y exportación Word (.docx) y PDF |
| **Bóveda de Expedientes** | N/A | SQLite local cifrado en disco del usuario |
| **Modelo de Privacidad** | Sin registro; telemetría web anónima agregada | Método BYOK; claves en Windows DPAPI; Cero Nube |

## Corpus y Fuentes

| Módulo | Fuente Oficial | Cobertura |
| --- | --- | --- |
| Legislación Federal | Cámara de Diputados | LFT, CCom, LGSM, LGTOC, CFF, LISR, LIVA, RLISR, RLIVA, LA, RLA, LCE, RLCE (5,011 disposiciones) |
| Licitaciones Abiertas | CompraNet / Plataforma Digital Nacional / Datos Abiertos | Procedimientos federales con filtro por entidad (LAASSP / LOPSRM) |
| Conectores estatales | Portales oficiales de Yucatán (TSJ), Nuevo León, Jalisco y CDMX | Cobertura estatal verificada y transparente |

## Desarrollo

Requisitos: Node.js 22+ y npm / pnpm.

```bash
npm install
npm run dev
```

Validación local y pruebas:

```bash
npm run lint
npm run validate:corpus
npm run test:run
npm run build
npm run preview
```

## Arquitectura

- **Frontend**: React 19, TypeScript, Vite y Tailwind CSS v4.
- **Motor de Legislación**: `sql.js` (SQLite en WebAssembly) ejecutado en memoria durante la sesión web.
- **Motor de Licitaciones**: Búsqueda estructurada por tokens y filtros facetados con cronogramas de cierre.
- **Estado**: Zustand para navegación y notificaciones efímeras.
- **PWA & Caché**: `vite-plugin-pwa` con Workbox configurado exclusivamente para el shell web estático.
- **Analítica Web**: Vercel Analytics y Speed Insights para medición de rendimiento y conversión hacia Desktop.
