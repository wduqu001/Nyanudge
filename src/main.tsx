import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './core/i18n'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ErrorBoundary } from './features/error/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
