---
name: pwa-mobile-engineering
description: >-
  Expert engineering and design system skill for building, optimizing, and productizing high-performance Progressive Web Apps (PWAs) with a strong focus on mobile-first touch UX/UI, offline-first SQLite WASM data layers, Web Share/Device APIs, and production readiness.
---

# PWA Mobile Engineering & Productization Skill

Esta skill proporciona los estándares de ingeniería, patrones de diseño UI/UX mobile-first, arquitecturas offline-first con WebAssembly (WASM) y directrices de productización para el desarrollo de Progressive Web Apps (PWAs) profesionales de alto rendimiento.

---

## 📱 1. Principios de Diseño UI/UX Mobile-First

El desarrollo móvil exige una ergonomía táctil estricta y atención al detalle visual:

### 1.1. Ergonomía del Pulgar (Thumb Zone) y Navegación
* **Bottom-Weighted Navigation:** Colocar los controles principales y la barra de navegación en la parte inferior de la pantalla (`Bottom Navigation Bar` o `Bottom Sheet`) para acceso cómodo con una sola mano.
* **Safe Area Insets:** Siempre respetar las muescas (notches) y barras de navegación de iOS/Android:
  ```css
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-top: max(0.5rem, env(safe-area-inset-top));
  ```
* **Touch Targets Mínimos:** Todos los botones, iconos interactivos y chips deben tener un área táctil mínima de **44x44 px** (o `p-2.5` / `p-3`).
* **Feedback Háptico y Visual:** Usar transiciones de escala al tocar (`active:scale-95 transition-transform duration-100`) para simular respuesta física nativa.

### 1.2. Higiene de Formularios e Inputs en Pantallas Táctiles
* **Prevención de Zoom Automático en iOS:** Configurar `text-base sm:text-sm` o mínimo `font-size: 16px` en inputs para evitar que Safari en iOS haga zoom involuntario al enfocar.
* **Teclados Especializados:**
  * Búsquedas: `type="search" enterKeyHint="search" inputMode="search"`
  * Códigos/Licencias: `autoCapitalize="characters" autoCorrect="off" spellCheck={false}`

### 1.3. Microinteracciones y Modales Móviles
* **Bottom Sheets Deslizables:** Preferir modales que suben desde la parte inferior (`items-end sm:items-center`, `rounded-t-3xl sm:rounded-2xl`) con animaciones de resorte (`framer-motion`: `initial={{ y: 40, opacity: 0 }}`).
* **Toasts Flotantes no Invasivos:** Notificaciones compactas con auto-cierre y botón de descarte manual, posicionadas en la parte superior derecha o centradas.

---

## ⚡ 2. Arquitectura de Datos Offline-First & SQLite WASM

### 2.1. Almacenamiento Local Dual (SQLite WASM + IndexedDB)
* **SQLite WASM (`sql.js`):**
  * Binario compilado `sql-wasm.wasm` servido desde `/wasm/` y precacheado en el Service Worker.
  * Funciones de usuario registradas en C/WASM (`db.create_function(...)`) para cálculo vectorial y scoring de relevancia en memoria en < 15ms.
  * Aislamiento de consultas por ley/dominio (`WHERE law_code = ?`) para reducir el universo de búsqueda y eliminar falsos positivos.
* **IndexedDB (`Dexie.js`):**
  * Almacenamiento persistente de casos, borradores y snapshots binarios de bases de datos para arranques instantáneos (0ms cold-start).

### 2.2. Estrategias de Caché en Service Worker (Workbox)
```javascript
// vite.config.ts / Workbox configuration
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm,json}'],
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  runtimeCaching: [
    {
      // Fuentes y assets estáticos: Cache-First
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 31536000 } }
    },
    {
      // APIs externas: Network-First con Fallback
      urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: { networkTimeoutSeconds: 5 }
    }
  ]
}
```

---

## 📲 3. Integración con Web Device APIs Nativas

1. **Web Share API (`navigator.share`):**
   * Permite enviar dictámenes, contratos o artículos oficiales directamente a WhatsApp, Slack, correo o notas nativas:
   ```typescript
   if (navigator.share) {
     await navigator.share({ title: docTitle, text: docContent });
   } else {
     await navigator.clipboard.writeText(docContent);
   }
   ```
2. **Async Clipboard API:**
   * Copiado al portapapeles con toast de confirmación instantáneo.
3. **Screen Wake Lock API (`navigator.wakeLock`):**
   * Evita que la pantalla del smartphone se apague durante audiencias o lectura de leyes extensas.
4. **Exportadores Documentales Nativo-Web:**
   * Generación de PDF formal con membrete y numeración de páginas vía `jspdf` / `html2canvas`.
   * Generación de Word `.docx` estructurado con `docx`.

---

## 💼 4. Productización, Licenciamiento y Conversión

### 4.1. Doble Modelo de Acceso y Onboarding
* **Modo Full Pro (Licencia Llave en Mano):**
  * Entrada inmediata mediante clave institucional preconfigurada.
* **Modo BYOK (Google AI Studio Asistido):**
  * Onboarding interactivo guiado en 3 pasos con enlace oficial de 1 toque a `aistudio.google.com/app/apikey`.
  * Verificador y probador de clave en vivo dentro del modal.

### 4.2. Privacidad como Argumento de Venta (Zero-Telemetry)
* Resaltar explícitamente que los datos, borradores y consultas viven **exclusivamente en el dispositivo del cliente** (IndexedDB local), garantizando secreto profesional y cumplimiento normativo.

### 4.3. Instalación PWA Standalone
* Captura del evento `beforeinstallprompt` para mostrar un banner personalizado de instalación con logo corporativo cuando el usuario navega desde Chrome o Safari móvil.
