# Routes

The app is a single-page React/Vite application without React Router. `src/App.tsx` owns routing through `URLSearchParams`, `history.replaceState`, and the `popstate` event.

| URL | Active component | Shared layout | Notes |
|---|---|---|---|
| `/` | `Introduction` | none | Product entry surface when station state is closed. |
| `/?tab=normativa` | `BuscadorLegal` | `AppShell` | Default station module; also uses `q`, `scope`, and `law`. |
| `/?tab=licitaciones` | `BuscadorLicitaciones` | `AppShell` | Uses procurement filter/search query parameters. |
| `/?tab=estudio` | `DraftingStudio` (new target) | `AppShell` | Planned template/document editor, import, and Fundamentador. |
| `/?tab=desktop` | lazy `DesktopPresentation` | `AppShell` | Preserve presentation content unchanged. |

## Full route owner: `src/App.tsx`

```tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppShell } from './components/AppShell';
import { BuscadorLegal } from './components/BuscadorLegal';
import { BuscadorLicitaciones } from './components/BuscadorLicitaciones';
import { Introduction } from './components/Introduction';
import { ErrorBoundary } from './components/ErrorBoundary';
import { trackEvent } from './lib/analytics';
import { updateSeoMeta } from './lib/seo';
import type { AppModuleTab } from './types';

const DesktopPresentation = lazy(() =>
  import('./components/DesktopPresentation').then((m) => ({ default: m.DesktopPresentation })),
);

export function App() {
  const [stationOpened, setStationOpened] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      params.has('q') || params.has('lq') || params.has('tab') || params.has('materia') ||
      params.has('caracter') || params.has('convocante') || params.has('entidad') ||
      params.has('estatus') || params.has('orden') || params.has('law') || params.has('scope')
    ) return true;
    return localStorage.getItem('lex_pwa_station_opened') === '1';
  });

  const [activeTab, setActiveTab] = useState<AppModuleTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'licitaciones' || tabParam === 'normativa' || tabParam === 'desktop') return tabParam;
    if (params.has('lq') || params.has('materia') || params.has('caracter') || params.has('convocante') || params.has('entidad') || params.has('estatus') || params.has('orden')) return 'licitaciones';
    return 'normativa';
  });

  const handleOpenStation = (targetTab?: AppModuleTab) => {
    try { localStorage.setItem('lex_pwa_station_opened', '1'); } catch { /* noop */ }
    trackEvent('station_enter', { target_tab: targetTab || 'normativa' });
    if (targetTab) {
      setActiveTab(targetTab);
      const url = new URL(window.location.href);
      if (targetTab === 'licitaciones') url.searchParams.set('tab', 'licitaciones');
      else if (targetTab === 'desktop') url.searchParams.set('tab', 'desktop');
      else url.searchParams.delete('tab');
      window.history.replaceState(null, '', url);
    }
    setStationOpened(true);
  };

  const handleTabChange = (nextTab: AppModuleTab) => {
    setActiveTab(nextTab);
    trackEvent('tab_change', { tab: nextTab });
    const url = new URL(window.location.href);
    if (nextTab === 'licitaciones') url.searchParams.set('tab', 'licitaciones');
    else if (nextTab === 'desktop') url.searchParams.set('tab', 'desktop');
    else url.searchParams.delete('tab');
    window.history.replaceState(null, '', url);
  };

  const handleGoHome = () => {
    try { localStorage.removeItem('lex_pwa_station_opened'); } catch { /* noop */ }
    trackEvent('home_return_click');
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState(null, '', url);
    setStationOpened(false);
  };

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'licitaciones') { setActiveTab('licitaciones'); setStationOpened(true); }
      else if (tabParam === 'desktop') { setActiveTab('desktop'); setStationOpened(true); }
      else if (tabParam === 'normativa') { setActiveTab('normativa'); setStationOpened(true); }
      else if (!params.toString() && localStorage.getItem('lex_pwa_station_opened') !== '1') setStationOpened(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!stationOpened) updateSeoMeta('home');
    else updateSeoMeta(activeTab);
  }, [stationOpened, activeTab]);

  return (
    <ErrorBoundary>
      {!stationOpened ? <Introduction onOpenStation={handleOpenStation} /> : (
        <AppShell activeTab={activeTab} onTabChange={handleTabChange} onGoHome={handleGoHome}>
          {activeTab === 'normativa' ? <BuscadorLegal /> : activeTab === 'licitaciones' ? <BuscadorLicitaciones /> : (
            <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center p-8 text-slate-400">Cargando Estación Desktop...</div>}>
              <DesktopPresentation />
            </Suspense>
          )}
        </AppShell>
      )}
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;
```

The route owner above is the current ground truth. The redesign must add explicit `estudio` parse/serialize/popstate/render branches instead of allowing it to fall through to Desktop.
