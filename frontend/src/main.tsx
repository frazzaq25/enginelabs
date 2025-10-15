import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export function App(): JSX.Element {
  return (
    <main>
      <h1>EHR Provider Notes frontend scaffold</h1>
      <p>This workspace hosts the provider-facing web application.</p>
    </main>
  );
}

if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
