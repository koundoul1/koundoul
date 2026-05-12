import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'

// Sentry monitoring (opt-in: set VITE_SENTRY_DSN_FRONTEND env var)
if (import.meta.env.VITE_SENTRY_DSN_FRONTEND) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_FRONTEND,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D1A', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Une erreur est survenue</h2>
          <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>L&apos;equipe a ete notifiee. Recharge la page.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', background: '#6C63FF', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
            Recharger
          </button>
        </div>
      </div>
    }>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
