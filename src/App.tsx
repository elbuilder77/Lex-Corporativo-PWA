import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Introduction } from './components/Introduction';
import { BuscadorLegal } from './components/BuscadorLegal';
import { HistorialFavoritos } from './components/HistorialFavoritos';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setNavigate } from './lib/router';

export function App() {
  const navigate = useNavigate();
  const [stationOpened, setStationOpened] = useState<boolean>(() => {
    return localStorage.getItem('lex_pwa_station_opened') === '1';
  });

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  const handleOpenStation = () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    setStationOpened(true);
    navigate('/buscador');
  };

return (
    <Routes>
      {!stationOpened ? (
        <Route path="*" element={<Introduction onOpenStation={handleOpenStation} />} />
      ) : (
        <Route
          path="/*"
          element={
            <ErrorBoundary>
              <AppShell>
                <Routes>
                  <Route path="/buscador" element={<BuscadorLegal />} />
                  <Route path="/historial" element={<HistorialFavoritos />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/buscador" replace />} />
                </Routes>
              </AppShell>
            </ErrorBoundary>
          }
        />
      )}
    </Routes>
  );
}

export default App;
