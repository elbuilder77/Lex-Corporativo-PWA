# Shared UI Components

## Framework and component model

- React 19 with TypeScript and Vite.
- Tailwind CSS v4 utility classes and custom tokens from `src/index.css`.
- No third-party component library and no dedicated `src/components/ui` primitive directory.
- Icons come from `lucide-react`.
- Shared interaction state and toast notifications come from `src/store/useUiStore.ts`.

## Existing shared patterns

The repository currently composes page-specific components directly. The reusable visual patterns Superdesign must preserve are:

- Dark slate application chrome with gold active/primary states.
- White rounded content cards with slate borders and restrained shadows.
- At least 44px touch targets on mobile navigation, dialog controls, filters, and actions.
- Bottom navigation on mobile and a compact top module switcher on larger viewports.
- Bottom-sheet behavior on mobile for coverage/information panels.
- Toast notifications rendered by `AppShell`.
- Serif headings (`Playfair Display Variable`) paired with sans-serif interface text (`Manrope Variable`).

## Source components to use as direct context

There are no generic primitives to duplicate here. Pass the full source files below directly to design calls when their patterns are needed:

- `src/components/AppShell.tsx` — global header, desktop tabs, mobile bottom navigation, install prompt, panels, and toasts.
- `src/components/CoverageSourcesSheet.tsx` — responsive sheet/dialog pattern.
- `src/components/SearchInfoSheet.tsx` — informational sheet/dialog pattern.
- `src/components/ErrorBoundary.tsx` — full-page failure state.
- `src/store/useUiStore.ts` — notification and connectivity state contract.

The full `AppShell` source is included in `layouts.md`; page-level source stays in the repository and is selected through `pages.md` to avoid duplicating large components in this discovery layer.
