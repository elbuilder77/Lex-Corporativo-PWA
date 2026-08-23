import { AppShell } from './components/AppShell';
import { BuscadorLegal } from './components/BuscadorLegal';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <AppShell>
        <BuscadorLegal />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
