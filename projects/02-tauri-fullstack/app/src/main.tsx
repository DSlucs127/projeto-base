import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@template/design-system/tokens.css';
import '@template/design-system/components.css';
import './styles/index.css';
import { App } from './App';
import { detectLocale, loadI18n } from './i18n/i18n';
import { I18nProvider } from './i18n/I18nProvider';

async function start(): Promise<void> {
  const initial = await loadI18n(detectLocale());
  document.documentElement.lang = initial.locale;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider initial={initial}>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}

void start();
