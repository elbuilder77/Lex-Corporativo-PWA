# Auditoría de rendimiento: Radar y Fundamentador

Fecha local: 6 de septiembre de 2026. Commit auditado: `fc2b05d68da3404629ea7a4245b1a42808048afb`, rama `desarrollo`.

## Dictamen

El Fundamentador tiene dos cuellos de botella reproducidos: inicialización completa del corpus y cálculo de relevancia síncrono. Con CPU limitada, una consulta general ya preparada ocupa alrededor de un segundo y la primera consulta supera cuatro segundos incluso con red local. Es la prioridad de rendimiento antes del primer release.

El motor del Radar funciona rápido con los 21 registros actuales. Sus costes visibles están en la carga compartida de la aplicación y en volver a renderizar las fichas al escribir. La medición no representa búsquedas en ComprasMX ni un backend remoto: el catálogo se importa desde código local.

Ambos módulos tardan unos 5,4 segundos en presentar el formulario en el escenario de red limitada. Hay mejoras comunes de empaquetado que benefician a los dos.

## Método y alcance

- Build de producción creado con `npm run build`, sin modificar el código del producto.
- Chrome `152.0.7977.76`, Node `v24.16.0`, Windows, AMD Ryzen 7 7730U.
- Escritorio: 1440 × 1000, CPU sin limitar, servidor local.
- Móvil emulado: 390 × 844, CPU ralentizada ×4, primero con servidor local y después con 1,6 Mbps de bajada, 750 kbps de subida y 150 ms de latencia configurada en CDP.
- Servidor de auditoría con gzip, CSP de `vercel.json` y `Cache-Control: no-cache`. No reproduce DNS, TLS, CDN ni cabeceras de caché de producción. Analítica Vercel no disponible en este servidor local.
- Tres contextos nuevos por módulo/perfil: 18 recorridos. Primera búsqueda y tres consultas posteriores por recorrido: 72 búsquedas en la interfaz. Medianas, sin atribuir significado estadístico a un p95 con esta muestra.
- Primera consulta: `servicios` en Radar y `rescisión laboral` en todo el corpus en Fundamentador. Posteriores: `IMSS`, `medicamentos`, `servicios`; y `prescripción fiscal`, `impuesto`, `rescisión laboral`, respectivamente. Las tres últimas consultas normativas de esta matriz siguen usando todo el corpus.
- Tiempo visible: desde activar Buscar hasta detectar el resultado esperado y completar dos frames. Incluye la espera del observador/automatización; **no es INP ni una medida pura del motor**. Entrada preparada: navegación hasta formulario visible y dos frames; no es LCP.
- Service Worker desactivado en la matriz para aislar el flujo. Una comprobación adicional, separada, activó el precaché y registró sus peticiones.
- Motor medido aparte en Chrome con las funciones reales empaquetadas en un arnés; siete muestras por consulta/tamaño y CPU. Se instrumentó el callback de relevancia para contar llamadas y tiempo. Esa instrumentación añade coste; no se resta del tiempo visible como si ambos experimentos fueran idénticos.

## Resultados de interfaz

Medianas en milisegundos. La columna posterior reúne nueve muestras por fila.

| Escenario | Módulo | Formulario preparado | Primera búsqueda → resultado visible | Búsquedas posteriores → resultado visible |
| --- | --- | ---: | ---: | ---: |
| Escritorio, red local | Radar | 308 | 98 | 43 |
| Escritorio, red local | Fundamentador | 306 | 848 | 210 |
| Móvil CPU ×4, red local | Radar | 1.077 | 371 | 130 |
| Móvil CPU ×4, red local | Fundamentador | 1.091 | 4.216 | 1.008 |
| Móvil CPU ×4, 1,6 Mbps / 150 ms | Radar | 5.399 | 712 | 142 |
| Móvil CPU ×4, 1,6 Mbps / 150 ms | Fundamentador | 5.407 | 15.421 | 1.338 |

La búsqueda empieza después de cargar el formulario. Por tanto, los 15,4 segundos del Fundamentador en red limitada son una espera adicional a la entrada de 5,4 segundos. El máximo bloqueo individual observado en ese perfil fue de 1.794 ms; con CPU ×4 y red local fue de 1.274 ms. Es posible que controles y animaciones no respondan durante esos bloques.

## Hallazgos priorizados

### 1. Alta: primera consulta normativa descarga y construye todas las materias

En `src/services/sqlite-db.ts:79` se inicia WASM y en `:104` se recorre el corpus con un `await fetch` por archivo, seguido de inserciones antes de comenzar el siguiente. No hay transacción explícita que agrupe la carga. Todo ocurre en el hilo principal.

Se observaron seis recursos: WASM y cinco JSON. Suman **5.308.080 bytes sin comprimir y 1.315.857 bytes con el gzip del experimento**. La traza de la primera consulta con CPU ×4/red local inicia las descargas de laboral, mercantil, fiscal, aduanal y comercio exterior aproximadamente a los 163, 856, 1.955, 2.495 y 2.746 ms del clic. La separación entre peticiones incluye el procesamiento del bloque anterior.

La comprobación adicional de **Artículo 47 LFT** también cargó los cinco JSON. Acotar a una ley reduce el trabajo posterior de ranking, pero no la inicialización. Al recargar se reconstruye la base en memoria. Las descargas efectivas en producción dependerán de su caché HTTP; en el servidor controlado volvieron a solicitarse los seis recursos.

**Acción propuesta:** sacar inicialización y consultas a un Worker; evaluar un SQLite preconstruido o carga por materia con índices; si se conserva JSON, separar la descarga de la inserción y agrupar las escrituras en transacciones. Un Worker mejora la capacidad de respuesta, sin garantizar por sí solo menos tiempo total.

### 2. Alta: relevancia vuelve a normalizar textos y recorre miles de filas

`calculateLegalScore` (`src/services/sqlite-db.ts:51`) normaliza título, contenido y número de artículo y vuelve a separar los términos en cada llamada. La consulta de `:141` filtra y ordena por esa función antes de aplicar `LIMIT`. El límite de 30 resultados no limita el trabajo a 30 filas.

| Consulta del motor | Llamadas a relevancia | Resultados | Mediana escritorio | Mediana CPU ×4 |
| --- | ---: | ---: | ---: | ---: |
| rescisión laboral, todo el corpus | 5.128 | 30 | 118 ms | 1.027 ms |
| impuesto, todo el corpus | 5.807 | 30 | 129 ms | 1.029 ms |
| prescripción fiscal, sólo fiscal | 1.477 | 30 | 49 ms | 371 ms |
| artículo 47, sólo LFT | 1.079 | 1 | 22 ms | 164 ms |
| zzzzzzzzzz, todo el corpus | 5.011 | 0 | 109 ms | 846 ms |

El callback consumió aproximadamente el 77–80 % del tiempo medido con CPU ×4. Las filas que pasan el filtro pueden volver a evaluarse para ordenar; la instrumentación observó más llamadas que las 5.011 filas existentes.

**Acción propuesta:** normalizar documentos al construir el índice y términos una vez por consulta; evitar reevaluar el mismo ranking; añadir una ruta indexada para ley/número de artículo. Evaluar un índice textual manteniendo los resultados y reglas actuales. Medir equivalencia y relevancia antes de sustituir el algoritmo.

### 3. Alta: los módulos comparten una carga JavaScript grande y precaché de otras pantallas

`dist/index.html` precarga `vendor-libs`, `vendor-framework` y `vendor-sqljs` incluso al entrar en Radar. En la medición de red, el JavaScript inicial completado suma **745.268 bytes gzip** y aproximadamente **2,51 MB descomprimidos**. `vendor-libs` aporta por sí solo 525.603 bytes gzip / 1.768.281 descomprimidos.

`vite.config.ts:59` agrupa casi todas las dependencias en un mismo chunk; `src/App.tsx:5` importa ambos buscadores de forma anticipada. Declarar Estudio como lazy no impide cargar dependencias que comparten esos chunks.

Con Service Worker habilitado y entrando únicamente a Radar se observaron peticiones de `DraftingStudio`, `DesktopPresentation` y el worker PDF, además del shell. Workbox precarga 19 entradas, aproximadamente 4.417 KiB descomprimidos. La matriz de tiempos anterior excluye ese trabajo de instalación. El total de bytes de las peticiones del experimento con SW depende de su política `no-cache`; no se atribuye ese total al despliegue real.

**Acción propuesta:** separar los módulos y las dependencias de edición/exportación según su uso real; verificar el grafo de imports después del cambio. Priorizar el precaché del flujo de entrada y evaluar cuándo descargar herramientas de Estudio, preservando el comportamiento offline que ya se validó. Revisar también el logo y favicon PNG: cada uno transfiere unos 230 kB en esta configuración.

### 4. Media: Radar vuelve a renderizar y formatear fichas al escribir

`BuscadorLicitaciones` conserva consulta y resultados en el mismo componente (`src/components/BuscadorLicitaciones.tsx:107`); el recorrido de fichas en `:758` vuelve a ejecutar formato de fechas/presupuesto y JSX con cada cambio de consulta.

Prueba adicional con las **21 fichas visibles**: 1.992 nodos DOM. Escribir `medicamentos` (12 caracteres, sin lanzar búsqueda) produjo **504 llamadas a `Date.toLocaleDateString`**. El tiempo desde cada evento input hasta dos frames fue de 57–80 ms con CPU ×4, media 66 ms. Esto demuestra trabajo repetido de renderizado/formato, aunque no mide qué proporción exacta corresponde a cada función.

Alternar tres veces entre Adquisiciones y Todas las materias dio una mediana de 144 ms con CPU ×4; expandir una ficha en la matriz tuvo una mediana de 116 ms. El coste del motor con los 21 registros fue de unos 7 ms en la medición separada. Los milisegundos mostrados por Radar corresponden al motor (`src/services/licitaciones-search.ts:150`), no a la respuesta visual completa.

**Acción propuesta:** extraer fichas con memoización y props estables; reutilizar formateadores/valores derivados. Separar el estado de escritura del renderizado de los resultados. Medir de nuevo antes de introducir virtualización para sólo 21 registros.

### 5. Media, al crecer: el Radar no tiene índice ni límite de resultados

`src/services/licitaciones-search.ts:18` normaliza múltiples campos por ficha y consulta. En `:121` puntúa la lista, la ordena y devuelve todos los resultados; la interfaz los recorre íntegramente.

Prueba sintética del **motor solamente**, replicando los 21 registros con identificadores distintos y buscando `servicios`:

| Registros | Mediana escritorio | Mediana CPU ×4 |
| ---: | ---: | ---: |
| 21 reales | 0,8 ms | 7 ms |
| 1.000 sintéticos | 31 ms | 226 ms |
| 10.000 sintéticos | 299 ms | 2.208 ms |

El caso de 10.000 devuelve 4.761 resultados. No se renderizaron esas miles de fichas y no representa una futura colección real: sirve para demostrar el coste del escaneo y normalización repetida, no una capacidad certificada.

**Acción propuesta antes de ampliar el catálogo:** preparar campos normalizados/índice y paginar resultados; medir con datos representativos de la ingestión prevista.

## Orden recomendado y criterios de comprobación

1. Fundamentador: separar trabajo del hilo principal y reducir carga inicial. Repetir primera consulta general y Artículo 47 LFT, comprobando recursos, bloqueos y recuperación de errores.
2. Fundamentador: índice/normalización y ruta exacta. Conservar identificadores, orden y trazabilidad de resultados; repetir las cinco consultas del motor.
3. Compartido: dividir dependencias y revisar precaché. Comprobar que Radar no descarga herramientas de edición/exportación como requisito de entrada y mantener las pruebas offline de Estudio.
4. Radar: reducir renderizados y formatos repetidos; repetir escritura de 12 caracteres, filtros y expansión con 21 fichas.
5. Antes de ampliar Radar: paginación e índice con un conjunto real mayor.

Los tests unitarios actuales de SQLite sustituyen `sql.js` y `fetch` en `src/test/setup.ts`; sirven para sus contratos, pero no detectan estos costes. Conviene conservar mediciones de navegador/motor con datos reales como comprobación de rendimiento, usando presupuestos acordados y una máquina/perfil repetible.

## Evidencia y reproducción local

- `.tmp/performance/results.json`: 18 recorridos y las muestras de ambos motores.
- `.tmp/performance/extra-results.json`: filtros, escritura, recarga, carga de artículo exacto y peticiones del precaché.
- `.tmp/performance/*-radar.png` y `*-fundamentador.png`: capturas de los estados medidos, inspeccionadas durante la auditoría.
- `.tmp/performance/audit.mjs` y `engine.ts`: arnés temporal; usa puerto 4181 y Chrome instalado.

```powershell
npm run build
node .tmp/performance/audit.mjs
$env:AUDIT_EXTRA='1'
node .tmp/performance/audit.mjs
Remove-Item Env:AUDIT_EXTRA
```

Los archivos `.tmp` son evidencia local ignorada por Git. El build pasó; no se aplicaron optimizaciones, commits ni pushes en esta auditoría. No se midieron producción/CDN, dispositivos físicos, Safari/Firefox ni latencia de proveedores externos. Los tiempos son resultados de laboratorio sobre este commit, no SLA ni Core Web Vitals de usuarios reales.

---

## Resultados post-optimización y subsanación de hallazgos (Fase de Cierre)

Tras la ejecución de las directivas de auditoría de las tres skills especializadas (`lex-performance-engineering`, `lex-security-privacy-auditor`, `lex-code-health-reliability`), se implementaron y verificaron las siguientes soluciones:

### 1. Rendimiento y Empaquetado (`lex-performance-engineering`)
- **División de Chunks (`vite.config.ts`)**:
  - Se desacopló el macro-chunk `vendor-libs` (1.77 MB) en chunks granulares: `vendor-framework`, `vendor-lucide`, `vendor-analytics`, `vendor-templates`, `vendor-editor`, `vendor-export`, y `vendor-pdf`.
  - Se configuró `modulePreload.resolveDependencies` para excluir dinámicamente dependencias pesadas de redacción/exportación del HTML inicial (`index.html`).
  - **Resultado**: El JavaScript inicial precargado en `<link rel="modulepreload">` se redujo de ~2.5 MB a **~240 kB sin comprimir (~75 kB gzip)** (~85% de reducción), cumpliendo holgadamente el presupuesto estricto de 500 kB de `lighthouse-budget.json`.
- **Motor SQLite WASM (`src/services/sqlite-db.ts`)**:
  - Carga bajo demanda por área jurídica (`loadArea`): ya no se descargan ni analizan las 5 materias al consultar una sola ley o área.
  - Inserciones atómicas en transacciones síncronas (`BEGIN TRANSACTION ... COMMIT`): se eliminó la concurrencia asíncrona desordenada en inserción.
  - Normalización anticipada (`prepareArticle`) durante la carga del corpus y caché de puntuaciones por ID (`prepared_legal_score`) durante la cláusula `ORDER BY`, erradicando el cálculo redundante por fila.
- **Radar de Licitaciones (`src/components/BuscadorLicitaciones.tsx`, `src/services/licitaciones-search.ts`)**:
  - Extracción y memoización de `LicitacionCard` con `React.memo` y formateadores de fecha/moneda estables.
  - Comparador de ordenamiento optimizado mediante timestamps numéricos epoch (`PREPARED_LICITACIONES`), evitando la instanciación de objetos `new Date()` en cada comparación de sort.
  - Soporte de parámetro `limit` en `LicitacionSearchFilter`.

### 2. Seguridad y Privacidad (`lex-security-privacy-auditor`)
- **Privacidad en Telemetría (`src/lib/analytics.ts`, `src/App.tsx`)**:
  - Sanitización de URLs con `sanitizeAnalyticsUrl` para despojar términos de búsqueda (`q`, `lq`, `searchTerms`) de los eventos de analítica y pageviews antes de su envío a Vercel Analytics y Speed Insights.
  - Supresión automática de propiedades sensibles en eventos personalizados (`query`, `q`, `lq`, `searchTerms`, `text`, `content`, `citation`).
- **Blindaje del Importador de Documentos (`src/lib/document-import.ts`)**:
  - Límites estrictos `DOCUMENT_IMPORT_LIMITS` contra ataques de denegación de servicio y Zip Bombs (máx. 10 MB archivo, máx. 250 entradas zip, máx. 15 MB XML descomprimido, radio máx. de descompresión 100x, máx. 150 páginas PDF, máx. 1,000,000 caracteres de texto).
  - Destrucción segura de instancias PDF.js en bloque `try...finally { await loadingTask.destroy(); }`.
- **Content Security Policy (`vercel.json`)**:
  - Inclusión explícita de `worker-src 'self' blob:;` para la ejecución íntegra y segura de Web Workers (WASM y PDF.js).

### 3. Confiabilidad y Calidad de Código (`lex-code-health-reliability`)
- **Suite de Pruebas**: 27 archivos de prueba, 125 pruebas unitarias e integración ejecutadas con Vitest: **100% pasando**.
- **Integridad de Corpus**: 5,011 disposiciones en 13 ordenamientos federales verificados íntegramente (`npm run validate:corpus`).
- **Análisis Estático**: 0 advertencias y 0 errores con Oxlint en 78 archivos de código fuente.
- **Verificación de Tipos**: `npx tsc -b --noEmit` completado sin errores.
- **Compilación de Producción y PWA**: Generación exitosa de bundles de producción y Service Worker (`workbox`) con 24 recursos precacheados.

