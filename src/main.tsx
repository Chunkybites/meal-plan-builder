import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BetaGate } from './components/BetaGate';
import { FeedbackWidget } from './components/FeedbackWidget';
import { initErrorReporting } from './utils/errorReporting';
import './index.css';

// Throttled, privacy-conscious crash reporting for the beta (production only).
if (import.meta.env.PROD) initErrorReporting();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BetaGate>
      <App />
      <FeedbackWidget />
    </BetaGate>
  </StrictMode>,
);
