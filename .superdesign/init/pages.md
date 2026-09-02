# Page Dependency Trees

## `/` — Introduction / product home

Entry: `src/App.tsx` (`stationOpened === false`)

- `src/App.tsx`
  - `src/components/Introduction.tsx`
    - `src/assets/logo-lockup-transparent.png`
    - `src/types.ts`
  - `src/components/ErrorBoundary.tsx`
  - `src/lib/analytics.ts`
  - `src/lib/seo.ts`

## `/?tab=normativa` — Federal legal search

Entry: `src/App.tsx` → `src/components/BuscadorLegal.tsx`

- `src/App.tsx`
  - `src/components/AppShell.tsx`
    - `src/components/CoverageSourcesSheet.tsx`
    - `src/components/SearchInfoSheet.tsx`
    - `src/store/useUiStore.ts`
    - `src/lib/coverage-sources.ts`
  - `src/components/BuscadorLegal.tsx`
    - `src/services/corpus-search.ts`
      - `src/services/sqlite-db.ts`
      - `src/lib/corpus-catalog.ts`
      - `src/types.ts`
    - `src/store/useUiStore.ts`
    - `src/lib/analytics.ts`

## `/?tab=licitaciones` — Public procurement search

Entry: `src/App.tsx` → `src/components/BuscadorLicitaciones.tsx`

- `src/App.tsx`
  - `src/components/AppShell.tsx`
  - `src/components/BuscadorLicitaciones.tsx`
    - `src/services/licitaciones-search.ts`
    - `src/lib/licitaciones-catalog.ts`
    - `src/store/useUiStore.ts`
    - `src/types.ts`

## `/?tab=estudio` — New document studio target

Entry target: `src/App.tsx` → `src/components/DraftingStudio.tsx`

- `src/components/DraftingStudio.tsx`
  - `src/lib/pwa-constants.ts`
  - `src/lib/docx-export.ts`
  - `src/lib/pdf-export.ts`
  - `src/lib/drafts-storage.ts`
  - `src/services/corpus-search.ts` (planned integrated Fundamentador)
  - `src/store/useUiStore.ts`
  - `src/types.ts`
  - `public/plantillas/*` (13 public overrides for the 25-template registry)

Target states: merged catalog, template editor, normalized rich editor, legal-research side panel, citation library, local drafts, DOCX-preserve import, TXT import, PDF original plus editable extraction, export, empty/loading/error/offline states.

## `/?tab=desktop` — Desktop product presentation (excluded from redesign)

Entry: `src/App.tsx` → lazy `src/components/DesktopPresentation.tsx`

- Preserve `src/components/DesktopPresentation.tsx` and `src/lib/desktop-specs.ts` unchanged.
- Only the surrounding shared `AppShell` may visually change.
