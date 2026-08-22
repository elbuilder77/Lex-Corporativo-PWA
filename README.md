# Lex Corporativo — Estación Jurídica PWA

Versión web progresiva (PWA) de **Lex Corporativo**, optimizada especialmente para dispositivos móviles, tablets y navegación web con capacidades offline completas.

---

## 🌟 Módulos Principales

1. **Búsqueda en Normativa Oficial con RAG (Móvil First)**:
   - Recuperación de artículos y fundamentación en leyes federales mexicanas.
   - Filtrado inteligente de corpus por materia (**Laboral: LFT**, **Mercantil: CCom/LGSM/LGTOC**, **Fiscal: CFF/LISR/LIVA**, **Aduanal: Ley Aduanera**, **Comercio Exterior: LCE**).
   - Generación de respuestas ejecutivas y fundamentadas con **Google Gemini (Google AI Studio)**.
   - Acciones rápidas: Copiar, Compartir (Web Share API para WhatsApp/correo) y Transferir al Redactor.

2. **Redactor Jurídico & Plantillas Personalizadas**:
   - Soporte para plantillas personalizadas en `/public/plantillas/`.
   - Edición rápida de contratos, pagarés, convenios y actas.
   - Botón **"Fundamentar y Redactar con IA"** que aplica automáticamente el marco jurídico mexicano aplicable.
   - Vista de hoja formal con membrete y exportación directa a **PDF** y **Word (.docx)**.

3. **Portafolio & Bóveda Local (IndexedDB)**:
   - Almacenamiento 100% privado en el navegador del usuario mediante `Dexie.js`.
   - Cero fuga de datos hacia servidores externos.

4. **Modelos de Acceso**:
   - **Desbloqueo Completo (Licencia Pro)**: Versión llave en mano con API lista para usarse.
   - **Modo BYOK (Google AI Studio)**: Asistente interactivo paso a paso para que el usuario obtenga su clave de API gratuita en Google AI Studio (`aistudio.google.com`).

---

## 🚀 Inicio en Desarrollo

```bash
cd "C:\Users\52999\Lex Corp Local\Lex-Corp-PAW"
npm run dev
```

## 📦 Compilación de Producción PWA

```bash
npm run build
npm run preview
```
