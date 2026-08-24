import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { BuscadorLegal } from './components/BuscadorLegal';
import { BuscadorLicitaciones } from './components/BuscadorLicitaciones';
import { Introduction } from './components/Introduction';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { AppModuleTab } from './types';

export function App() {
  const [stationOpened, setStationOpened] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    // If URL has search query or specific parameters, open the station directly
    if (
      params.has('q') ||
      params.has('lq') ||
      params.has('tab') ||
      params.has('materia') ||
      params.has('convocante') ||
      params.has('law') ||
      params.has('scope')
    ) {
      return true;
    }
    return localStorage.getItem('lex_pwa_station_opened') === '1';
  });

  const [activeTab, setActiveTab] = useState<AppModuleTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'licitaciones' || tabParam === 'normativa') {
      return tabParam;
    }
    if (params.has('lq') || params.has('materia') || params.has('convocante')) {
      return 'licitaciones';
    }
    return 'normativa';
  });

  const handleOpenStation = (targetTab?: AppModuleTab) => {
    try {
      localStorage.setItem('lex_pwa_station_opened', '1');
    } catch {
      /* noop */
    }
    if (targetTab) {
      setActiveTab(targetTab);
      const url = new URL(window.location.href);
      if (targetTab === 'licitaciones') url.searchParams.set('tab', 'licitaciones');
      else url.searchParams.delete('tab');
      window.history.replaceState(null, '', url);
    }
    setStationOpened(true);
  };

  const handleTabChange = (nextTab: AppModuleTab) => {
    setActiveTab(nextTab);
    const url = new URL(window.location.href);
    if (nextTab === 'licitaciones') {
      url.searchParams.set('tab', 'licitaciones');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState(null, '', url);
  };

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'licitaciones') setActiveTab('licitaciones');
      else if (tabParam === 'normativa') setActiveTab('normativa');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <ErrorBoundary>
      {!stationOpened ? (
        <Introduction onOpenStation={handleOpenStation} />
      ) : (
        <AppShell activeTab={activeTab} onTabChange={handleTabChange}>
          {activeTab === 'normativa' ? <BuscadorLegal /> : <BuscadorLicitaciones />}
        </AppShell>
      )}
    </ErrorBoundary>
  );
}

export default App;
