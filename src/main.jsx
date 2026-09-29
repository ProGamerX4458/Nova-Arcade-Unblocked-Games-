import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
if (container && !window.__nova_arcade_mounted__) {
  window.__nova_arcade_mounted__ = true;
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
