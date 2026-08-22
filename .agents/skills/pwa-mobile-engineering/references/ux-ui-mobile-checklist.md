# Checklist UX/UI para PWAs Móviles de Alta Gama

Usa esta lista de verificación en cada componente y vista de la PWA:

## 1. Diseño Táctil y Ergonomía
- [ ] **Zona del Pulgar:** Botones de acción primaria (Buscar, Redactar, Compartir) ubicados en la mitad inferior o al alcance del pulgar.
- [ ] **Touch Targets:** Botones con tamaño mínimo de 44x44px y padding táctil cómodo.
- [ ] **Feedback Táctil:** Clases `active:scale-95 transition-transform duration-100` y estados activos claros.
- [ ] **Scroll Horizontal Oculto:** Carruseles y chips de materias con `scrollbar-hide` y márgenes negativos `-mx-3 px-3` para fluidez táctil en bordes de pantalla.

## 2. Prevención de Fricción en Teclado Móvil
- [ ] **Evitar Zoom Indeseado en iOS:** Inputs con tamaño de fuente mínimo de 16px (`text-sm sm:text-xs` o `text-base`).
- [ ] **Botones de Teclado Adecuados:** Atributos `enterKeyHint="search"`, `inputMode="search"` en buscadores.
- [ ] **Auto-capitalización:** `autoCapitalize="characters"` en campos de claves de licencia o códigos.

## 3. Identidad de Marca y Legibilidad
- [ ] **Paleta Corporativa:** Fondos oscuros ejecutivos (`#070b13`, `#090d16`), acentos dorados (`#c5a059`), y texto de alto contraste (`text-slate-100`).
- [ ] **Tipografía Dual:** Encabezados editoriales en `Playfair Display` y cuerpo funcional legible en `Manrope`.
- [ ] **Modo Hoja Membretada:** Vista previa de documentos con diseño formal de papel legal (`.legal-letterhead`).

## 4. Adaptabilidad y Muescas (Notches)
- [ ] **Safe Area Bottom:** Espaciado inferior para la barra de inicio de iPhone (`pb-16 md:pb-0` y `env(safe-area-inset-bottom)`).
- [ ] **Header Superior Táctil:** Altura de 56px (`h-14`) con logo nítido, indicador de estado de IA y acceso a ajustes.
