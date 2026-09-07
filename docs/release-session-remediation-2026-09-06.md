# Subsanación de la sesión del borrador

Fecha: 6 de septiembre de 2026. Rama: `desarrollo`. Base: `5ff329dd56915323b9f16bd1d1c58d993e284f7c`.

Los fallos reproducidos en la auditoría de la sesión del borrador están corregidos y cubiertos por regresiones. La validación corresponde al checkout local; no equivale a un release publicado ni a una validación del despliegue remoto.

## Cambios y evidencia

| Fallo reproducido | Corrección | Verificación |
| --- | --- | --- |
| Salir antes del autoguardado pierde cambios | Sesión independiente de React, cola de escritura y transición que espera el guardado | Pruebas de sesión, navegación y navegador |
| Recuperación tardía sustituye una edición nueva | Control de revisión; habilitar Tiptap no emite cambios de contenido | Componente y recarga real en Chrome |
| Cita entrante sustituida por recuperación o consumida antes de guardar | Recuperar primero; confirmar recepción después de persistir, incluyendo documentos con sólo una cita | Sesión con escritura fallida/reintento; búsqueda WASM, recarga y exportación TXT |
| Eliminar y Ctrl+S resucita el activo | Invalidar revisión pendiente y crear lienzo con identidad nueva | Sesión y navegador con recarga |
| Título/citas no marcan pendiente; escritura anterior confirma la siguiente | Guardado asociado a una revisión y estado accesible | Pruebas de escrituras concurrentes y UI |
| Fallo de lectura parece lista vacía; refrescar lista hace parecer fallida una escritura exitosa | Error visible, reintento y rescate TXT; lista actualizada desde escritura confirmada | Pruebas de almacenamiento, sesión y componente |
| Reaplicar variables pierde contenido/citas y no recupera contexto | Generar copia explícita, conservar original y guardar valores de plantilla | Navegador: editar, generar copia, recargar y reabrir original |
| Historial no vuelve a Legislación | Resolver navegación inicial y popstate con la misma regla y proteger salida | Siete pruebas de navegación y recorrido real Atrás |
| DOCX recupera párrafos eliminados o desalineados por espacios vacíos | Importar/exportar con la misma selección de párrafos y vaciar texto eliminado | ZIP/XML, estilos y original conservados; recorrido DOCX real |
| Handlebars falla con CSP | Precompilar en build y usar runtime sin relajar CSP | Equivalencia de 38 fuentes (25 embebidas + 13 públicas); navegador bajo CSP configurada |
| Diálogos sin foco contenido y campos sin asociación | Diálogo compartido con fondo inerte, Escape, contención/restauración; labels asociados | Pruebas del diálogo, Tab/Escape y capturas |
| Icono del buscador solapado; textos de cifrado y paginación inexactos | Padding específico; estado de almacenamiento local y descripción de vista de edición | Inspección visual de capturas desktop/móvil |
| Dos pestañas pueden sobrescribir borradores | Web Lock de una única pestaña escritora y reintento explícito | Dos pestañas reales, cierre de la primera y recuperación en la segunda |
| Versión antigua bloquea actualización de IndexedDB indefinidamente | Aviso para cerrar otras pestañas y reintentar; cierre de conexiones tardías | Migración v1/v2 y regresión de bloqueo |
| Worker PDF excluido del precaché | Incluir `.mjs` en Workbox | Primera importación PDF con red desconectada después del precaché |

CI queda alineado con `master`/`desarrollo`, Node 24, pruebas Playwright y Lighthouse sobre Estudio. El README documenta el editor y su persistencia local.

## Validación local

- `npm run lint`: sin incidencias.
- `npm run validate:corpus`: 5.011 disposiciones, 13 ordenamientos y 5.011 identificadores únicos.
- `npm run test:run`: 120 pruebas aprobadas en 27 archivos.
- `npm run build`: TypeScript y producción correctos; Workbox incluye 19 entradas y el worker PDF.
- `npm run test:e2e`: 14 recorridos aprobados, siete en escritorio (1440 × 1000) y siete en móvil emulado (390 × 844), con Google Chrome, IndexedDB real y CSP de `vercel.json`.
- `git diff --check`: sin errores de espacios.

Playwright produce informe en `../.tmp/playwright-report/index.html` y capturas/descargas en `../.tmp/playwright-results/`. Se regeneran con cada ejecución y no forman parte del código versionado.

La revisión visual cubre catálogo, editor, estado de guardado, variables, borradores y aviso de segunda pestaña. Se inspeccionaron capturas; los controles probados permiten completar los recorridos y no se detectó desbordamiento horizontal en el editor móvil. La cabecera móvil ocupa bastante espacio: reducir su densidad queda como mejora posterior, sin rediseño en esta subsanación.

## Límites y publicación

La cuota y los fallos de almacenamiento se inyectan en pruebas; no se agotó el disco real. El móvil es emulado en Chrome, sin prueba en dispositivo físico, Safari o Firefox. La prueba offline se limita al PDF después de precargar la aplicación; el corpus/WASM no se precarga. DOCX verifica texto y conservación del paquete/estilos, no equivalencia visual completa en Microsoft Word.

El build aún avisa de un chunk de bibliotecas de 1,77 MB (aproximadamente 530 kB gzip). No se ha presentado este trabajo como optimización integral de rendimiento.

El primer release oficial requiere todavía versionado (el paquete conserva `0.0.0`), notas de publicación y comprobación de CI/despliegue remotos. El envío de estas correcciones a `origin/desarrollo` no constituye un release oficial. Los archivos de skills instalados por el usuario se conservan locales.

El catálogo muestra 25 instrumentos. Las 13 fuentes públicas coinciden con identificadores embebidos y sustituyen su contenido cuando se descargan. Queda pendiente comprobar la deduplicación por contenido frente al criterio de añadir las plantillas aportadas sin ocultar variantes distintas; las pruebas de renderizado no resuelven esa decisión del catálogo.
